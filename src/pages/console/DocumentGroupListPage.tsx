import { fetchDocumentGroups } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentGroupTable from '@/components/console/DocumentGroupTable';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';

const LOADING_MESSAGE = '문서 그룹을 불러오고 있습니다.';
const EMPTY_MESSAGE = '아직 문서 그룹이 없습니다.';

export default function DocumentGroupListPage() {
  const { state, retry } = useConsoleFetch(fetchDocumentGroups);

  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
      <ConsolePageHeader
        title="문서 그룹"
        description="챗봇 검색에 사용하는 문서를 그룹 단위로 관리합니다"
      />

      {state.status === 'loading' && <ConsoleLoading message={LOADING_MESSAGE} />}

      {state.status === 'failed' && (
        <ConsoleFetchError message={state.error.message} onRetry={retry} />
      )}

      {/* 그룹이 없는 경우는 실패가 아니라 빈 배열의 성공이다. */}
      {state.status === 'ready' &&
        (state.data.length === 0 ? (
          <p className="text-label text-label-alternative">{EMPTY_MESSAGE}</p>
        ) : (
          <DocumentGroupTable groups={state.data} />
        ))}
    </ConsolePage>
  );
}
