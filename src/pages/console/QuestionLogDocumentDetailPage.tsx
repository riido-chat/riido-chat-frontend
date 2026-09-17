import { useCallback } from 'react';
import { useParams } from 'react-router';

import { fetchFirstDocumentGroup, fetchQuestionLogDocumentDetail } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import type { BreadcrumbEntry } from '@/components/console/ConsoleTopBar';
import MetricTile from '@/components/console/MetricTile';
import SubproblemTable from '@/components/console/SubproblemTable';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';
import { formatQuestionCount, formatSubproblemCount } from '@/lib/console';
import type { QuestionLogDocumentDetail } from '@/types/console.types';

const LOADING_MESSAGE = '문서를 불러오고 있습니다.';
const EMPTY_GROUP_MESSAGE = '아직 문서 그룹이 없습니다.';
const PARENT_BREADCRUMB: BreadcrumbEntry[] = [
  { label: '질문 로그', to: '/question-logs' },
  { label: '문서 목록', to: '/question-logs/documents' },
];

type DocumentDetailData = {
  groupId: number;
  detail: QuestionLogDocumentDetail;
};

/**
 * 문서 상세 화면. 문서 목록과 대시보드 미리보기의 문서 행에서 들어오며 상단 경로는 질문 로그 > 문서 목록 > 문서명이다.
 * 요약 타일 넷과 세부 문제 표를 보이고 읽기 전용이라 추가, 편집, 그룹 이동 컨트롤은 없다.
 * 주소는 목록에서 넘어오므로 없는 문서에 닿을 일이 없어 NOT_FOUND 를 따로 다루지 않는다.
 */
export default function QuestionLogDocumentDetailPage() {
  const { documentId } = useParams();
  // 주소 표시줄에서 받은 값은 문자열이므로 정수로 바꾼다.
  const numericDocumentId = Number(documentId);

  const fetchDetail = useCallback(
    async (signal: AbortSignal): Promise<DocumentDetailData | null> => {
      const group = await fetchFirstDocumentGroup(signal);

      if (group === null) {
        return null;
      }

      const detail = await fetchQuestionLogDocumentDetail(group.groupId, numericDocumentId, signal);

      return { groupId: group.groupId, detail };
    },
    [numericDocumentId],
  );
  const { state, retry } = useConsoleFetch(fetchDetail);

  if (state.status !== 'ready') {
    return (
      <ConsolePage breadcrumb={PARENT_BREADCRUMB}>
        {state.status === 'loading' ? (
          <ConsoleLoading message={LOADING_MESSAGE} />
        ) : (
          <ConsoleFetchError message={state.error.message} onRetry={retry} />
        )}
      </ConsolePage>
    );
  }

  // 그룹이 없는 경우는 실패가 아니라 집계할 대상이 없는 성공이다.
  if (state.data === null) {
    return (
      <ConsolePage breadcrumb={PARENT_BREADCRUMB}>
        <p className="text-label text-label-alternative">{EMPTY_GROUP_MESSAGE}</p>
      </ConsolePage>
    );
  }

  const { groupId, detail } = state.data;

  return (
    <ConsolePage breadcrumb={[...PARENT_BREADCRUMB, { label: detail.document.documentTitle }]}>
      <div className="flex flex-col gap-4">
        <ConsolePageHeader title={detail.document.documentTitle} />
        {/* 근거 부족과 캐시 답변은 질문 단위 집계이고 세부 문제만 개수라 단위가 다르다. */}
        <section
          aria-label="문서 요약"
          className="border-line-normal bg-background-default flex w-full items-start gap-8 rounded-xl border p-5"
        >
          <MetricTile label="질문 수" value={formatQuestionCount(detail.summary.questionCount)} />
          <MetricTile
            label="근거 부족"
            value={formatQuestionCount(detail.summary.insufficientEvidenceCount)}
          />
          <MetricTile
            label="캐시 답변"
            value={formatQuestionCount(detail.summary.cachedAnswerCount)}
          />
          <MetricTile
            label="세부 문제"
            value={formatSubproblemCount(detail.summary.subproblemCount)}
          />
        </section>
      </div>

      <section aria-label="세부 문제" className="flex flex-col gap-4">
        <h2 className="text-headline text-label-strong font-semibold">세부 문제</h2>
        {/* 문서가 바뀌면 펼친 행을 접고 새로 시작하도록 문서마다 다른 트리를 만든다. */}
        <SubproblemTable
          key={detail.document.documentId}
          groupId={groupId}
          subproblems={detail.subproblems}
        />
      </section>
    </ConsolePage>
  );
}
