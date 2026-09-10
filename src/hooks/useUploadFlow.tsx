import { useState } from 'react';

import { toConsoleApiError, uploadDocument } from '@/api/console';
import DocumentUploadDialog from '@/components/console/DocumentUploadDialog';
import UploadResultDialog from '@/components/console/UploadResultDialog';
import type {
  ConsoleDocument,
  DocumentUploadRequest,
  DocumentUploadTarget,
  UploadOutcome,
} from '@/types/console.types';

type UploadFlowParams = {
  /** 실행이 끝나 배경 상세가 바뀌었을 때의 재조회 */
  onRefetch: () => void;
  /** 결과 모달의 검색에 반영하기. 결과 모달을 닫은 뒤 검색 반영 확인 모달을 연다. */
  onRequestReindex: () => void;
};

/**
 * 신규 문서 업로드와 수정본 업로드 흐름. 업로드 모달과 결과 모달을 함께 돌려준다.
 * 성공과 실패 모두 결과 모달로 넘어가고, 실패의 다시 업로드는 실패한 원래 모달을 처음 상태로 다시 연다.
 * 실패는 code 로 화면을 나누지 않고 모두 오류 모달 하나로 보내며, 본문은 서버가 내려준 message 그대로다.
 * NOT_FOUND, JOB_IN_PROGRESS, INVALID_REQUEST, DOCUMENT_NOT_REVISABLE 은 버튼이 비활성인 정상 흐름에서 도달할 수 없으므로 따로 다루지 않는다.
 */
export function useUploadFlow({ onRefetch, onRequestReindex }: UploadFlowParams) {
  const [target, setTarget] = useState<DocumentUploadTarget | null>(null);
  // 다시 업로드는 실패한 원래 모달로 돌아가야 하므로 직전 대상을 남겨 둔다.
  const [failedTarget, setFailedTarget] = useState<DocumentUploadTarget | null>(null);
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);

  const upload = async (request: DocumentUploadRequest) => {
    // 성공이든 실패든 결과 모달로 넘어가므로, 되돌아갈 대상을 미리 붙들어 둔다.
    const uploadingTarget = target;

    try {
      const result = await uploadDocument(request);
      // 성공하면 새 판이 잡히고 반영 대기가 하나 늘며 검색 반영 상태가 반영 필요로 바뀐다.
      onRefetch();
      setOutcome({ status: 'ready', result });
    } catch (error) {
      // 어느 경우든 기존 문서와 ACTIVE 색인은 그대로 남는다.
      setFailedTarget(uploadingTarget);
      setOutcome({ status: 'failed', message: toConsoleApiError(error).message });
    } finally {
      setTarget(null);
    }
  };

  const openNew = (groupId: number) => setTarget({ mode: 'new', groupId });

  const openRevision = (document: ConsoleDocument) =>
    setTarget({ mode: 'revision', documentId: document.documentId, documentTitle: document.title });

  const dialogs = (
    <>
      {/* 취소나 닫기로 모달만 닫히고 상세 화면은 그대로 유지한다. */}
      <DocumentUploadDialog target={target} onClose={() => setTarget(null)} onUpload={upload} />
      <UploadResultDialog
        outcome={outcome}
        onClose={() => setOutcome(null)}
        onReindex={() => {
          // 반영 대상 버전은 화면에 나열하지 않는다.
          setOutcome(null);
          onRequestReindex();
        }}
        onRetry={() => {
          // 입력값을 유지하지 않고, 실패한 원래 업로드 모달을 처음 상태로 다시 연다.
          setOutcome(null);
          setTarget(failedTarget);
        }}
      />
    </>
  );

  return { openNew, openRevision, dialogs };
}
