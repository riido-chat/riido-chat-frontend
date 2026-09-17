import { fetchQuestionLogDocuments, fetchQuestionLogTargetGroup } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import QuestionLogDocumentTable from '@/components/console/QuestionLogDocumentTable';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';
import { formatQuestionLogScope } from '@/lib/console';
import type { DocumentGroupSummary, QuestionLogDocument } from '@/types/console.types';

const LOADING_MESSAGE = '문서 목록을 불러오고 있습니다.';
const EMPTY_GROUP_MESSAGE = '아직 문서 그룹이 없습니다.';
const DASHBOARD_PATH = '/question-logs';

/**
 * 대시보드 미리보기가 앞 3행만 잘라 보이던 같은 목록을 전체 행으로 받는다.
 * 페이지와 정렬 파라미터가 없어 서버가 질문 수 내림차순으로 맞춘 순서를 그대로 보이고, 그룹이 없으면 null 이다.
 */
type QuestionLogDocumentListData = {
  group: DocumentGroupSummary;
  documents: QuestionLogDocument[];
};

async function fetchQuestionLogDocumentListData(
  signal: AbortSignal,
): Promise<QuestionLogDocumentListData | null> {
  const group = await fetchQuestionLogTargetGroup(signal);

  if (group === null) {
    return null;
  }

  const { items } = await fetchQuestionLogDocuments(group.groupId, signal);

  return { group, documents: items };
}

/**
 * 질문 로그의 문서 목록 화면. 사이드바의 문서 목록과 대시보드 문서 목록 블록의 더보기로 들어온다.
 * 읽기 전용이라 정렬, 필터, 페이지네이션이 없고, 조회 실패는 표 자리에 인라인 오류로 보인다.
 */
export default function QuestionLogDocumentListPage() {
  const { state, retry } = useConsoleFetch(fetchQuestionLogDocumentListData);

  return (
    <ConsolePage breadcrumb={[{ label: '질문 로그', to: DASHBOARD_PATH }, { label: '문서 목록' }]}>
      <div className="flex flex-col gap-4">
        <ConsolePageHeader
          title="문서 목록"
          description={
            state.status === 'ready' && state.data !== null
              ? formatQuestionLogScope(state.data.group.name)
              : undefined
          }
        />

        {state.status === 'loading' && <ConsoleLoading message={LOADING_MESSAGE} />}

        {state.status === 'failed' && (
          <ConsoleFetchError message={state.error.message} onRetry={retry} />
        )}

        {/* 그룹이 없는 경우는 실패가 아니라 집계할 대상이 없는 성공이다. */}
        {state.status === 'ready' &&
          (state.data === null ? (
            <p className="text-label text-label-alternative">{EMPTY_GROUP_MESSAGE}</p>
          ) : (
            <QuestionLogDocumentTable items={state.data.documents} />
          ))}
      </div>
    </ConsolePage>
  );
}
