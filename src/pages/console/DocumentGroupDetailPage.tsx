import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';

import { ConsoleApiError, fetchDocumentGroupDetail } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentGroupDetailView, {
  DOCUMENT_GROUP_LIST_PATH,
} from '@/components/console/DocumentGroupDetailView';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';

const LOADING_MESSAGE = '문서 그룹을 불러오고 있습니다.';

// 주소가 정수가 아니면 서버에 묻지 않고 없는 그룹과 같은 응답으로 다룬다.
const INVALID_GROUP_ERROR = new ConsoleApiError({
  code: 'NOT_FOUND',
  message: '존재하지 않는 문서 그룹입니다.',
});

// 그룹이 없거나 사라진 경우는 재조회 중이라도 보고 있던 상세를 버리고 화면 전체 오류로 바꾼다.
const isGroupMissingError = (error: ConsoleApiError) => error.code === 'NOT_FOUND';

// 주소 표시줄에서 받은 값은 문자열이므로 정수로 바꾼다.
const parseGroupId = (groupId: string | undefined) => {
  const parsed = Number(groupId);

  return groupId !== undefined && Number.isInteger(parsed) ? parsed : null;
};

/** 없는 그룹과 사라진 그룹이 함께 쓰는 화면 전체 오류 */
function MissingGroupPage() {
  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
      <ConsolePageHeader
        title="문서 그룹을 찾을 수 없습니다"
        description="주소가 바뀌었거나 삭제된 문서 그룹입니다"
      />
      <Link to={DOCUMENT_GROUP_LIST_PATH} className="text-label text-label-alternative underline">
        문서 그룹 목록으로 돌아가기
      </Link>
    </ConsolePage>
  );
}

/** 주소의 그룹을 조회해 조회 중, 실패, 없음, 상세 화면 가운데 하나를 보인다. */
export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const parsedGroupId = parseGroupId(groupId);
  // 그룹이 사라진 뒤 도달한 실행은 조회와 별개로 알게 되므로, 어느 그룹이 사라졌는지 따로 기억한다.
  const [missingGroupId, setMissingGroupId] = useState<number | null>(null);

  const fetchDetail = useCallback(
    (signal: AbortSignal) =>
      parsedGroupId === null
        ? Promise.reject(INVALID_GROUP_ERROR)
        : fetchDocumentGroupDetail(parsedGroupId, signal),
    [parsedGroupId],
  );
  const { state, refetch, retry } = useConsoleFetch(fetchDetail, { isFatal: isGroupMissingError });

  const isMissing =
    missingGroupId === parsedGroupId ||
    (state.status === 'failed' && isGroupMissingError(state.error));

  if (isMissing) {
    return <MissingGroupPage />;
  }

  if (state.status !== 'ready') {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리', to: DOCUMENT_GROUP_LIST_PATH }]}>
        {state.status === 'loading' ? (
          <ConsoleLoading message={LOADING_MESSAGE} />
        ) : (
          <ConsoleFetchError message={state.error.message} onRetry={retry} />
        )}
      </ConsolePage>
    );
  }

  return (
    // 그룹이 바뀌면 열려 있던 모달을 모두 새로 시작하도록 그룹마다 다른 트리를 만든다.
    <DocumentGroupDetailView
      key={state.data.group.groupId}
      detail={state.data}
      onRefetch={refetch}
      onGroupMissing={() => setMissingGroupId(state.data.group.groupId)}
    />
  );
}
