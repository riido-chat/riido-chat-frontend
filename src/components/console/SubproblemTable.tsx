import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { fetchQuestionLogQuestions } from '@/api/console';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { AnswerStatusBadge, ApplyStatusBadge } from '@/components/console/StatusBadge';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';
import {
  EMPTY_VALUE,
  formatAbsoluteTime,
  formatQuestionCount,
  formatRelativeTime,
} from '@/lib/console';
import { cn } from '@/lib/utils';
import type { CanonicalAnswer, DocumentSubproblem } from '@/types/console.types';

const QUESTIONS_LOADING_MESSAGE = '속한 질문을 불러오고 있습니다.';
const NO_CANONICAL_MESSAGE = '정본 없음';
// 펼침은 스크롤로 최근 질문을 최대 100건까지만 미리 본다.
const QUESTIONS_PAGE_SIZE = 100;
// 속한 질문 표는 헤더 40 과 행 60 다섯 줄까지만 보이고 그 아래는 표 안에서 세로로 스크롤한다.
const QUESTIONS_MAX_HEIGHT_CLASS = 'max-h-85';

/** 펼침 영역의 항목 하나. 라벨 아래에 본문 상자나 표가 온다. */
function ExpandField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-caption text-label-assistive font-medium">{label}</p>
      {children}
    </div>
  );
}

/** 정본 답변 본문. Markdown 을 그대로 보이되 상자 안에서 목록 들여쓰기만 살린다. */
function CanonicalAnswerBody({ canonicalAnswer }: { canonicalAnswer: CanonicalAnswer | null }) {
  return (
    <div className="border-line-normal bg-background-default text-body-2 rounded-lg border p-3">
      {canonicalAnswer === null ? (
        <p className="text-label-assistive">{NO_CANONICAL_MESSAGE}</p>
      ) : (
        <div className="text-label-normal flex flex-col gap-2">
          <ReactMarkdown
            components={{
              ol: ({ children, start }) => (
                <ol start={start} className="list-decimal space-y-1 pl-5">
                  {children}
                </ol>
              ),
              ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
            }}
          >
            {canonicalAnswer.contentMarkdown}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

/**
 * 세부 문제에 속한 질문 표. 질문 목록과 같은 행이지만 문서와 세부 문제 열은 펼친 행이 이미 말해 주므로 뺀다.
 * 펼칠 때 조회하고, 실패는 펼침 영역 안에 인라인으로 보인다.
 * 질문이 많아도 펼침이 화면을 다 차지하지 않도록 이 표만 예외로 세로 스크롤을 두고 헤더는 고정한다.
 */
function SubproblemQuestions({ groupId, subproblemId }: { groupId: number; subproblemId: string }) {
  const fetchQuestions = useCallback(
    (signal: AbortSignal) =>
      fetchQuestionLogQuestions(groupId, { subproblemId, size: QUESTIONS_PAGE_SIZE }, signal),
    [groupId, subproblemId],
  );
  const { state, retry } = useConsoleFetch(fetchQuestions);

  if (state.status === 'loading') {
    return <ConsoleLoading message={QUESTIONS_LOADING_MESSAGE} />;
  }

  if (state.status === 'failed') {
    return <ConsoleFetchError message={state.error.message} onRetry={retry} />;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <ConsoleTable
        containerClassName={cn(QUESTIONS_MAX_HEIGHT_CLASS, 'overflow-y-auto')}
        // 고정된 헤더는 border-collapse 아래에서 밑선이 함께 스크롤되므로 안쪽 그림자로 선을 다시 그린다.
        className="min-w-0 [&_th]:sticky [&_th]:top-0 [&_th]:shadow-[inset_0_-1px_0_var(--color-line-normal)]"
      >
        <colgroup>
          <col />
          <col className="w-21" />
          <col className="w-40" />
        </colgroup>
        <thead>
          <tr>
            <ConsoleTableHead>질문 원문</ConsoleTableHead>
            <ConsoleTableHead>시각</ConsoleTableHead>
            <ConsoleTableHead>답변 상태</ConsoleTableHead>
          </tr>
        </thead>
        <ConsoleTableBody>
          {state.data.items.length === 0 ? (
            <tr>
              <ConsoleTableCell colSpan={3} className="text-label-assistive h-15">
                {EMPTY_VALUE}
              </ConsoleTableCell>
            </tr>
          ) : (
            state.data.items.map((item) => (
              <tr key={item.ragRunId}>
                <ConsoleTableCell className="h-15 truncate" title={item.question}>
                  {item.question}
                </ConsoleTableCell>
                <ConsoleTableCell
                  className="text-label-assistive h-15 truncate"
                  title={formatAbsoluteTime(item.askedAt)}
                >
                  {formatRelativeTime(item.askedAt)}
                </ConsoleTableCell>
                <ConsoleTableCell className="h-15">
                  <AnswerStatusBadge
                    answerStatus={item.answerStatus}
                    withheldReason={item.withheldReason}
                  />
                </ConsoleTableCell>
              </tr>
            ))
          )}
        </ConsoleTableBody>
      </ConsoleTable>

      {state.data.totalCount > 0 && (
        <p className="text-caption text-label-assistive self-end px-2">
          전체 {formatQuestionCount(state.data.totalCount)} 중 최근{' '}
          {formatQuestionCount(state.data.items.length)} 표시
        </p>
      )}
    </div>
  );
}

/**
 * 세부 문제 행 아래의 인라인 확장. 정본 답변 본문, 적용 범위 규칙, 속한 질문 순서로 보인다.
 * 정본이 없으면 본문 자리에 정본 없음 한 줄만 두고 적용 범위 규칙은 두지 않는다. 빈 칸 자체가 작업 지시라 경고 색은 쓰지 않는다.
 */
function SubproblemExpand({
  groupId,
  subproblem,
}: {
  groupId: number;
  subproblem: DocumentSubproblem;
}) {
  return (
    <tr>
      <td colSpan={4} className="border-line-normal bg-rc-gray-50 border-b px-4 pt-3.5 pb-4">
        <div className="flex flex-col gap-3">
          <ExpandField label="정본 답변 본문">
            <CanonicalAnswerBody canonicalAnswer={subproblem.canonicalAnswer} />
          </ExpandField>
          {subproblem.canonicalAnswer !== null && (
            <ExpandField label="적용 범위 규칙">
              <ul className="flex flex-col gap-2">
                {subproblem.canonicalAnswer.applicabilityRules.map((rule) => (
                  <li
                    key={rule}
                    className="border-line-normal bg-background-default text-body-2 text-label-normal truncate rounded-lg border p-3"
                    title={rule}
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </ExpandField>
          )}
          <ExpandField label="속한 질문">
            <SubproblemQuestions groupId={groupId} subproblemId={subproblem.subproblemId} />
          </ExpandField>
        </div>
      </td>
    </tr>
  );
}

/** 세부 문제 한 행과 그 아래 펼침. 행 전체가 클릭 대상이고 키보드는 이름 버튼으로 같은 동작을 한다. */
function SubproblemRowGroup({
  groupId,
  subproblem,
  isExpanded,
  onToggle,
}: {
  groupId: number;
  subproblem: DocumentSubproblem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          'hover:bg-rc-gray-50 cursor-pointer transition-colors',
          // 펼친 행은 아래 펼침 영역과 같은 배경으로 이어진다.
          isExpanded && 'bg-rc-gray-50',
        )}
      >
        <ConsoleTableCell className="truncate">
          <button
            type="button"
            aria-expanded={isExpanded}
            title={subproblem.name}
            className="focus-visible:ring-button-primary-enabled max-w-full cursor-pointer truncate rounded-sm text-left outline-none focus-visible:ring-2"
          >
            {subproblem.name}
          </button>
        </ConsoleTableCell>
        <ConsoleTableCell>{subproblem.questionCount}</ConsoleTableCell>
        {/* 승인 정본이 없거나 첫 인용이 없으면 절이 없으므로 하이픈으로 적는다. */}
        <ConsoleTableCell
          className="text-label-assistive truncate"
          title={subproblem.sourceSection ?? undefined}
        >
          {subproblem.sourceSection ?? EMPTY_VALUE}
        </ConsoleTableCell>
        <ConsoleTableCell>
          <ApplyStatusBadge status={subproblem.applyStatus} />
        </ConsoleTableCell>
      </tr>
      {isExpanded && <SubproblemExpand groupId={groupId} subproblem={subproblem} />}
    </>
  );
}

type SubproblemTableProps = {
  groupId: number;
  /** 서버가 질문 수 내림차순으로 정렬해 준 순서를 그대로 쓴다. */
  subproblems: DocumentSubproblem[];
};

/**
 * 문서 상세의 세부 문제 표. 행을 누르면 그 행 바로 아래가 펼쳐지고 같은 행을 다시 누르면 접힌다.
 * 한 번에 한 행만 펼치며 드로어와 접기 버튼은 두지 않는다. 문서가 바뀌면 상위가 트리를 새로 만든다.
 */
export default function SubproblemTable({ groupId, subproblems }: SubproblemTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (subproblemId: string) =>
    setExpandedId((current) => (current === subproblemId ? null : subproblemId));

  return (
    <ConsoleTable containerClassName="rounded-xl">
      <colgroup>
        <col />
        <col className="w-27.5" />
        <col className="w-111" />
        <col className="w-40" />
      </colgroup>
      <thead>
        <tr>
          <ConsoleTableHead>세부 문제</ConsoleTableHead>
          <ConsoleTableHead>질문 수</ConsoleTableHead>
          <ConsoleTableHead>근거 문서 절</ConsoleTableHead>
          <ConsoleTableHead>적용 상태</ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {subproblems.length === 0 ? (
          <tr>
            <ConsoleTableCell colSpan={4} className="text-label-assistive">
              {EMPTY_VALUE}
            </ConsoleTableCell>
          </tr>
        ) : (
          subproblems.map((subproblem) => (
            <SubproblemRowGroup
              key={subproblem.subproblemId}
              groupId={groupId}
              subproblem={subproblem}
              isExpanded={expandedId === subproblem.subproblemId}
              onToggle={() => toggle(subproblem.subproblemId)}
            />
          ))
        )}
      </ConsoleTableBody>
    </ConsoleTable>
  );
}
