import { useEffect, useState } from 'react';

import { fetchDocumentGroups, toConsoleApiError } from '@/api/console';
import { Button } from '@/components/common/button';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentGroupTable from '@/components/console/DocumentGroupTable';
import type { DocumentGroupSummary } from '@/types/console.types';

const LOADING_MESSAGE = '문서 그룹을 불러오고 있습니다.';
const EMPTY_MESSAGE = '아직 문서 그룹이 없습니다.';

/**
 * 목록 조회의 진행 상태. 조회 중에는 표를 그리지 않고, 실패하면 서버가 내려준 message 를 그대로 보인다.
 * 그룹이 없는 경우는 실패가 아니라 빈 배열의 성공이다.
 */
type DocumentGroupListState =
  | { status: 'loading' }
  | { status: 'ready'; groups: DocumentGroupSummary[] }
  | { status: 'failed'; message: string };

export default function DocumentGroupListPage() {
  const [state, setState] = useState<DocumentGroupListState>({ status: 'loading' });
  // 다시 시도는 같은 조회를 반복하므로, 값을 올려 effect 를 다시 실행시킨다.
  const [attempt, setAttempt] = useState(0);

  // 첫 조회는 초기 상태가 조회 중이고, 다시 시도는 버튼에서 조회 중으로 되돌린 뒤 effect 를 다시 실행한다.
  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchDocumentGroups(controller.signal)
      .then((groups) => setState({ status: 'ready', groups }))
      .catch((error: unknown) => {
        // 화면을 떠나며 중단한 요청은 실패가 아니므로 상태를 바꾸지 않는다.
        if (controller.signal.aborted) {
          return;
        }

        setState({ status: 'failed', message: toConsoleApiError(error).message });
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
      <ConsolePageHeader
        title="문서 그룹"
        description="챗봇 검색에 사용하는 문서를 그룹 단위로 관리합니다"
      />

      {state.status === 'loading' && (
        <p className="text-label text-label-alternative animate-pulse" aria-live="polite">
          {LOADING_MESSAGE}
        </p>
      )}

      {state.status === 'failed' && (
        <div className="flex flex-col items-start gap-3" role="alert">
          <p className="text-label text-label-normal">{state.message}</p>
          <Button variant="console-secondary" size="md" onClick={retry}>
            다시 시도
          </Button>
        </div>
      )}

      {state.status === 'ready' &&
        (state.groups.length === 0 ? (
          <p className="text-label text-label-alternative">{EMPTY_MESSAGE}</p>
        ) : (
          <DocumentGroupTable groups={state.groups} />
        ))}
    </ConsolePage>
  );
}
