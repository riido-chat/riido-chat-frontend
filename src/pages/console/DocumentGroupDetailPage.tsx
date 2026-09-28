import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { fetchDocumentGroupDetail } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import DocumentGroupDetailView, {
  DOCUMENT_GROUP_LIST_PATH,
} from '@/components/console/DocumentGroupDetailView';
import { consoleQueryKeys } from '@/lib/consoleQueryKeys';

const LOADING_MESSAGE = '문서 그룹을 불러오고 있습니다.';

/**
 * 주소의 그룹을 조회해 조회 중, 실패, 상세 화면 가운데 하나를 보인다.
 * 주소는 목록에서 넘어오므로 없는 그룹에 닿을 일이 없어 NOT_FOUND 를 따로 다루지 않는다.
 */
export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  // 주소 표시줄에서 받은 값은 문자열이므로 정수로 바꾼다.
  const numericGroupId = Number(groupId);

  const query = useQuery({
    queryKey: consoleQueryKeys.documentGroup(numericGroupId),
    queryFn: ({ signal }) => fetchDocumentGroupDetail(numericGroupId, signal),
  });

  if (query.data === undefined) {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리', to: DOCUMENT_GROUP_LIST_PATH }]}>
        {query.isError ? (
          <ConsoleFetchError message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <ConsoleLoading message={LOADING_MESSAGE} />
        )}
      </ConsolePage>
    );
  }

  return (
    // 그룹이 바뀌면 열려 있던 모달을 모두 새로 시작하도록 그룹마다 다른 트리를 만든다.
    <DocumentGroupDetailView key={query.data.group.groupId} detail={query.data} />
  );
}
