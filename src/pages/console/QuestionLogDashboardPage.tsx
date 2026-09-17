import { Link } from 'react-router';

import ChevronRight from '@/assets/icons/ChevronRight.svg?react';
import {
  fetchFirstDocumentGroup,
  fetchQuestionLogDashboard,
  fetchQuestionLogDocuments,
  fetchQuestionLogQuestions,
  toConsoleApiError,
} from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import QuestionLogDocumentTable from '@/components/console/QuestionLogDocumentTable';
import QuestionTable from '@/components/console/QuestionTable';
import RankCard, { type RankRow } from '@/components/console/RankCard';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';
import {
  EMPTY_VALUE,
  formatQuestionCount,
  formatWithheldReasonCounts,
  WITHHELD_REASON_LABEL,
} from '@/lib/console';
import type {
  FrequentSubproblem,
  QuestionLogDashboard,
  QuestionLogDocument,
  QuestionLogItem,
  WithheldDocument,
} from '@/types/console.types';

const LOADING_MESSAGE = '질문 로그를 불러오고 있습니다.';
const EMPTY_GROUP_MESSAGE = '아직 문서 그룹이 없습니다.';
const DOCUMENT_LIST_PATH = '/question-logs/documents';
const QUESTION_LIST_PATH = '/question-logs/questions';
// 두 미리보기는 상위 3행만 보이고 나머지는 각 목록 화면에서 본다.
const PREVIEW_SIZE = 3;

/**
 * 블록 하나의 조회 결과. 집계 실패는 타일 자리에, 목록 실패는 표 자리에 인라인 오류로 보이므로
 * 두 조회를 각각의 성공과 실패로 나눠 들고 있다.
 */
type BlockResult<T> = { status: 'ready'; data: T } | { status: 'failed'; message: string };

type QuestionLogDashboardData = {
  dashboard: BlockResult<QuestionLogDashboard>;
  documents: BlockResult<QuestionLogDocument[]>;
  questions: BlockResult<QuestionLogItem[]>;
};

const toBlockResult = <T,>(settled: PromiseSettledResult<T>): BlockResult<T> =>
  settled.status === 'fulfilled'
    ? { status: 'ready', data: settled.value }
    : { status: 'failed', message: toConsoleApiError(settled.reason).message };

/**
 * 대시보드와 미리보기는 문서 목록 화면과 같은 첫 문서 그룹을 대상으로 삼고, 그룹이 없으면 null 로 빈 상태를 알린다.
 * 집계, 문서 목록, 질문 목록은 하나가 실패해도 나머지를 보이도록 함께 기다린 뒤 각각의 결과로 나눈다.
 * 문서 목록은 페이지가 없어 전체를 받아 앞 3행만 자르고, 질문 목록은 size 로 3건만 받는다.
 */
async function fetchFirstGroupDashboard(
  signal: AbortSignal,
): Promise<QuestionLogDashboardData | null> {
  const group = await fetchFirstDocumentGroup(signal);

  if (group === null) {
    return null;
  }

  const [dashboard, documents, questions] = await Promise.allSettled([
    fetchQuestionLogDashboard(group.groupId, signal),
    fetchQuestionLogDocuments(group.groupId, signal).then((list) =>
      list.items.slice(0, PREVIEW_SIZE),
    ),
    fetchQuestionLogQuestions(group.groupId, { size: PREVIEW_SIZE }, signal).then(
      (page) => page.items,
    ),
  ]);

  return {
    dashboard: toBlockResult(dashboard),
    documents: toBlockResult(documents),
    questions: toBlockResult(questions),
  };
}

// 세부 문제가 이 그룹 문서에 속하지 않으면 문서 제목이 null 이므로 하이픈으로 적는다.
const toSubproblemRow = (subproblem: FrequentSubproblem): RankRow => ({
  key: subproblem.subproblemId,
  title: subproblem.name,
  subtitle: subproblem.documentTitle ?? EMPTY_VALUE,
  value: `질문 ${formatQuestionCount(subproblem.questionCount)}`,
});

const toWithheldDocumentRow = (document: WithheldDocument): RankRow => ({
  key: String(document.documentId),
  title: document.documentTitle,
  value: `${WITHHELD_REASON_LABEL.insufficientEvidence} ${formatQuestionCount(document.insufficientEvidenceCount)}`,
});

/** 지표 타일 한 장. 숫자와 단위를 함께 적고 기간 라벨과 증감 표시는 두지 않는다. */
function MetricTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap">
      <p className="text-label text-label-assistive font-medium">{label}</p>
      <p className="text-title-2 text-label-strong font-bold">{value}</p>
      {detail && <p className="text-label text-label-assistive font-medium">{detail}</p>}
    </div>
  );
}

/** 미리보기 블록의 제목. 제목과 더보기 화살표가 한 링크라 어느 쪽을 눌러도 목록 화면으로 간다. */
function SectionLink({ title, to }: { title: string; to: string }) {
  return (
    <Link
      to={to}
      className="focus-visible:ring-button-primary-enabled flex w-fit items-center rounded-lg outline-none focus-visible:ring-2"
    >
      <h2 className="text-heading text-label-normal font-semibold">{title}</h2>
      <ChevronRight aria-hidden className="text-icon-gray-enabled m-2 size-6 shrink-0" />
    </Link>
  );
}

/** 집계 블록. 지표 타일 두 장과 순위 카드 두 장을 보인다. */
function DashboardBlock({ dashboard }: { dashboard: QuestionLogDashboard }) {
  return (
    <>
      <section
        aria-label="질문 로그 요약"
        className="border-line-normal bg-background-default flex w-full items-start gap-8 rounded-xl border p-5"
      >
        <MetricTile label="질문 수" value={formatQuestionCount(dashboard.questionCount)} />
        <MetricTile
          label="답변 불가"
          value={formatQuestionCount(dashboard.unanswerableCount)}
          detail={formatWithheldReasonCounts(dashboard.withheldReasonCounts)}
        />
      </section>
      {/* 자주 묻는 세부 문제는 세부 문제 단위, 답변 보류가 많은 문서는 문서 단위라 단위가 다른 것이 의도다. */}
      <div className="flex w-full items-start gap-4">
        <RankCard
          title="자주 묻는 세부 문제"
          rows={dashboard.frequentSubproblems.map(toSubproblemRow)}
        />
        <RankCard
          title="답변 보류가 많은 문서"
          rows={dashboard.withheldDocuments.map(toWithheldDocumentRow)}
        />
      </div>
    </>
  );
}

/**
 * 질문 로그의 첫 화면. 요약과 진입 지점 역할만 하며 편집 컨트롤은 없다.
 * 집계 실패는 타일 자리에, 목록 실패는 각 표 자리에 인라인 오류로 보이고, 다시 시도는 세 조회를 함께 반복한다.
 */
export default function QuestionLogDashboardPage() {
  const { state, retry } = useConsoleFetch(fetchFirstGroupDashboard);

  if (state.status !== 'ready') {
    return (
      <ConsolePage breadcrumb={[{ label: '질문 로그' }, { label: '질문 분석 대시보드' }]}>
        <div className="flex flex-col gap-4">
          <ConsolePageHeader title="질문 분석 대시보드" />
          {state.status === 'loading' ? (
            <ConsoleLoading message={LOADING_MESSAGE} />
          ) : (
            <ConsoleFetchError message={state.error.message} onRetry={retry} />
          )}
        </div>
      </ConsolePage>
    );
  }

  return (
    <ConsolePage breadcrumb={[{ label: '질문 로그' }, { label: '질문 분석 대시보드' }]}>
      <div className="flex flex-col gap-4">
        <ConsolePageHeader title="질문 분석 대시보드" />

        {/* 그룹이 없는 경우는 실패가 아니라 집계할 대상이 없는 성공이다. */}
        {state.data === null ? (
          <p className="text-label text-label-alternative">{EMPTY_GROUP_MESSAGE}</p>
        ) : state.data.dashboard.status === 'ready' ? (
          <DashboardBlock dashboard={state.data.dashboard.data} />
        ) : (
          <ConsoleFetchError message={state.data.dashboard.message} onRetry={retry} />
        )}
      </div>

      {state.data !== null && (
        <>
          <section aria-label="문서 목록 미리보기" className="flex flex-col gap-4">
            <SectionLink title="문서 목록" to={DOCUMENT_LIST_PATH} />
            {state.data.documents.status === 'ready' ? (
              <QuestionLogDocumentTable items={state.data.documents.data} />
            ) : (
              <ConsoleFetchError message={state.data.documents.message} onRetry={retry} />
            )}
          </section>
          <section aria-label="질문 목록 미리보기" className="flex flex-col gap-4">
            <SectionLink title="질문 목록" to={QUESTION_LIST_PATH} />
            {state.data.questions.status === 'ready' ? (
              <QuestionTable items={state.data.questions.data} />
            ) : (
              <ConsoleFetchError message={state.data.questions.message} onRetry={retry} />
            )}
          </section>
        </>
      )}
    </ConsolePage>
  );
}
