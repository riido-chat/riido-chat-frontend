import { useState } from 'react';

import { toConsoleApiError } from '@/api/console';
import ReindexDialog from '@/components/console/ReindexDialog';
import { reindexDocumentGroupMock } from '@/mocks/console';
import type { ReindexStep } from '@/types/console.types';

type ReindexFlowParams = {
  groupId: number;
  /** 실행이 끝나 배경 상세가 바뀌었을 때의 재조회 */
  onRefetch: () => void;
};

/**
 * 검색 반영 흐름. 확인, 잠금, 완료 또는 실패를 한 모달에서 단계로 보이며, 단계 상태와 모달을 함께 돌려준다.
 * 업로드 결과 모달과 수집 결과 모달의 검색에 반영하기도 이 흐름의 확인 단계로 들어온다.
 */
export function useReindexFlow({ groupId, onRefetch }: ReindexFlowParams) {
  // null 이면 모달이 닫힌 상태다.
  const [step, setStep] = useState<ReindexStep | null>(null);

  /**
   * 검색 반영 시작. 응답이 올 때까지 잠금 모달로 화면 전체를 막고, 응답이 오면 바로 완료나 실패로 넘어간다.
   * 실패 모달의 다시 시도도 별도 엔드포인트 없이 이 호출을 반복한다.
   */
  const start = async () => {
    setStep({ status: 'running' });

    try {
      const result = await reindexDocumentGroupMock(groupId);
      // 성공하면 새 검색 버전이 ACTIVE 가 되고 반영 대기가 없어진다. 확인을 누르기 전에 배경 상세가 갱신되어 있어야 한다.
      onRefetch();
      setStep({ status: 'done', result });
    } catch (error) {
      // 실패 모달은 한 종류이고 본문은 응답의 message 그대로다. 기존 ACTIVE 색인과 검색 코퍼스는 그대로 남는다.
      setStep({ status: 'failed', message: toConsoleApiError(error).message });
    }
  };

  const openConfirm = () => setStep({ status: 'confirm' });

  const dialog = (
    <ReindexDialog
      step={step}
      onClose={() => {
        // 완료의 확인과 실패의 닫기 모두 모달만 닫고, 닫힐 때 상세 재조회 1회를 안전망으로 둔다.
        setStep(null);
        onRefetch();
      }}
      onStart={() => void start()}
    />
  );

  return { openConfirm, dialog };
}
