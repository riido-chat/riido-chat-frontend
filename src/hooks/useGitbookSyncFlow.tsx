import { useState } from 'react';

import { syncGitbook, toConsoleApiError } from '@/api/console';
import GitbookSyncDialog from '@/components/console/GitbookSyncDialog';
import GitbookSyncResultDialog from '@/components/console/GitbookSyncResultDialog';
import type { GitbookSyncOutcome, GitbookSyncTarget } from '@/types/console.types';

type GitbookSyncFlowParams = {
  groupId: number;
  /** 상세 조회의 GitBook 원천 루트 URL. 원천이 있으면 읽기 전용으로 보이고, 없으면 null 이라 입력을 받는다. */
  rootUrl: string | null;
  /** 실행이 끝나 배경 상세가 바뀌었을 때의 재조회 */
  onRefetch: () => void;
  /** 결과 모달의 검색에 반영하기. 결과 모달을 닫은 뒤 검색 반영 확인 모달을 연다. */
  onRequestReindex: () => void;
};

/**
 * GitBook 수집 흐름. 수집 모달이 수집 중까지 맡고, 응답이 오면 결과 모달로 바꿔 보인다.
 * 오류 모달의 다시 시도는 입력값을 유지하지 않고 수집 모달을 처음 상태로 다시 연다.
 */
export function useGitbookSyncFlow({
  groupId,
  rootUrl,
  onRefetch,
  onRequestReindex,
}: GitbookSyncFlowParams) {
  // null 이면 각각 닫힌 상태다.
  const [target, setTarget] = useState<GitbookSyncTarget | null>(null);
  const [outcome, setOutcome] = useState<GitbookSyncOutcome | null>(null);

  const open = () => setTarget({ groupId, rootUrl });

  /**
   * GitBook 수집 시작. 응답이 올 때까지 수집 모달이 비활성으로 남고, 응답이 오면 결과 모달로 바꿔 보인다.
   * 오류는 code 로 화면을 나누지 않고 모두 오류 모달 하나로 보내며, 본문은 서버가 내려준 message 그대로다.
   * 404 와 409 는 헤더 버튼이 비활성인 정상 흐름에서 도달할 수 없으므로 따로 다루지 않는다.
   */
  const sync = async (sourceUrl: string) => {
    // 열린 모달이 가리키는 그룹에 수집해야 하므로, 현재 상세의 groupId 대신 열 당시 대상을 쓴다.
    const syncingTarget = target;

    if (syncingTarget === null) {
      return;
    }

    try {
      const result = await syncGitbook(syncingTarget.groupId, sourceUrl);
      // 수집이 끝나면 반영 대기가 늘고 문서 표가 바뀌지만, 검색에는 반영되지 않아 검색 반영 상태 뱃지는 그대로다.
      onRefetch();
      setOutcome({ status: 'done', result });
    } catch (error) {
      setOutcome({ status: 'failed', message: toConsoleApiError(error).message });
    } finally {
      setTarget(null);
    }
  };

  const dialogs = (
    <>
      <GitbookSyncDialog target={target} onClose={() => setTarget(null)} onSync={sync} />
      <GitbookSyncResultDialog
        outcome={outcome}
        onClose={() => {
          // 닫기는 모달만 닫고, 반영 대기가 갱신된 상세가 보이도록 재조회 1회를 안전망으로 둔다.
          setOutcome(null);
          onRefetch();
        }}
        onReindex={() => {
          setOutcome(null);
          onRequestReindex();
        }}
        onRetry={() => {
          setOutcome(null);
          open();
        }}
      />
    </>
  );

  return { open, dialogs };
}
