import { useCallback, useState } from 'react';

import Search from '@/assets/icons/Search.svg?react';
import {
  ConsoleApiError,
  fetchQuestionLogDocuments,
  fetchQuestionLogQuestions,
  fetchQuestionLogTargetGroup,
} from '@/api/console';
import { Input } from '@/components/common/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/tabs';
import { ConsoleFetchError, ConsoleLoading } from '@/components/console/ConsoleFetchFallback';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import ConsoleSelect, { type ConsoleSelectOption } from '@/components/console/ConsoleSelect';
import QuestionTable from '@/components/console/QuestionTable';
import { useConsoleFetch } from '@/hooks/useConsoleFetch';
import { ANSWER_STATUS_LABEL, formatQuestionCount, formatQuestionLogScope } from '@/lib/console';
import { cn } from '@/lib/utils';
import type {
  AnswerStatus,
  DocumentGroupSummary,
  QuestionLogDocument,
  QuestionLogPage,
  QuestionLogQuery,
} from '@/types/console.types';

const PAGE_LOADING_MESSAGE = '질문 목록을 불러오고 있습니다.';
const QUESTIONS_LOADING_MESSAGE = '질문을 불러오고 있습니다.';
const EMPTY_GROUP_MESSAGE = '아직 문서 그룹이 없습니다.';
const EMPTY_TITLE = '조건에 맞는 질문이 없습니다';
const EMPTY_DESCRIPTION = '필터를 바꿔 보세요. 결과가 없는 것은 오류가 아닙니다';
const RESET_LABEL = '필터 초기화';
const BREADCRUMB = [{ label: '질문 로그', to: '/question-logs' }, { label: '질문 목록' }];
// 서버 기본값과 같다. 페이지 문구의 범위 계산에도 쓰므로 화면이 직접 든다.
const PAGE_SIZE = 20;
// 검색어는 100자를 넘으면 INVALID_REQUEST 라 입력란에서 막는다.
const QUERY_MAX_LENGTH = 100;
// 상태 칩의 전체. 서버에는 보내지 않는 화면 전용 값이다.
const ALL_STATUS = 'ALL';

type SubproblemPresence = NonNullable<QuestionLogQuery['subproblemPresence']>;

const STATUS_OPTIONS: { value: AnswerStatus | typeof ALL_STATUS; label: string }[] = [
  { value: ALL_STATUS, label: '전체' },
  { value: 'ANSWERED', label: ANSWER_STATUS_LABEL.ANSWERED },
  { value: 'CACHED_ANSWER', label: ANSWER_STATUS_LABEL.CACHED_ANSWER },
  { value: 'WITHHELD', label: ANSWER_STATUS_LABEL.WITHHELD },
  { value: 'ERROR', label: ANSWER_STATUS_LABEL.ERROR },
];

// 세부 문제 유무는 있음과 없음만 고르고, 없음은 분류 없는 질문까지 포함한다.
const PRESENCE_OPTIONS: { value: SubproblemPresence; label: string }[] = [
  { value: 'PRESENT', label: '있음' },
  { value: 'ABSENT', label: '없음' },
];

/** 화면이 드는 필터. 셀렉트와 칩으로만 바꾸므로 서버가 거부하는 값이 만들어지지 않는다. */
type QuestionFilters = {
  answerStatus?: AnswerStatus;
  documentId?: number;
  subproblemPresence?: SubproblemPresence;
  // 앞뒤 공백을 걷은 검색어. 비어 있으면 보내지 않는다.
  q: string;
  page: number;
};

const INITIAL_FILTERS: QuestionFilters = { q: '', page: 1 };

const toQuery = ({ q, ...filters }: QuestionFilters): QuestionLogQuery => ({
  ...filters,
  q: q === '' ? undefined : q,
  size: PAGE_SIZE,
});

type QuestionListData = {
  group: DocumentGroupSummary;
  // 문서 셀렉트의 옵션. 문서 없음과 분류 없음은 옵션이 아니라 세부 문제 없음 필터로 본다.
  documents: QuestionLogDocument[];
};

/** 문서 셀렉트 옵션은 문서 목록 API 의 행을 그대로 쓴다. 화면에 들어올 때 한 번만 받는다. */
async function fetchQuestionListData(signal: AbortSignal): Promise<QuestionListData | null> {
  const group = await fetchQuestionLogTargetGroup(signal);

  if (group === null) {
    return null;
  }

  const { items } = await fetchQuestionLogDocuments(group.groupId, signal);

  return { group, documents: items };
}

/** 표 하단의 페이지 문구와 이전·다음. 마지막 페이지를 넘긴 빈 응답도 총 건수는 그대로라 범위는 0건으로 적는다. */
function Pagination({
  page,
  totalCount,
  onPageChange,
}: {
  page: QuestionLogPage['page'];
  totalCount: QuestionLogPage['totalCount'];
  onPageChange: (page: number) => void;
}) {
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);
  const hasPrevious = page > 1;
  const hasNext = end < totalCount;

  const pagerClassName = (enabled: boolean) =>
    cn(
      'text-caption rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-button-primary-enabled',
      enabled ? 'text-rc-iris-500 cursor-pointer hover:underline' : 'text-label-assistive',
    );

  return (
    <div className="text-caption flex h-9 items-center justify-between px-3.5">
      <p className="text-label-assistive">
        {start > end ? '0건' : `${start}-${end}`} / {formatQuestionCount(totalCount)}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className={pagerClassName(hasPrevious)}
        >
          이전
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className={pagerClassName(hasNext)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

/** 조건에 맞는 질문이 없을 때 표 자리에 보이는 빈 상태. 오류가 아니므로 경고색과 아이콘을 쓰지 않는다. */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-line-normal bg-background-default flex flex-col items-center gap-2 rounded-xl border px-6 py-11">
      <p className="text-body-1 text-label-strong font-semibold">{EMPTY_TITLE}</p>
      <p className="text-body-2 text-label-assistive">{EMPTY_DESCRIPTION}</p>
      <button
        type="button"
        onClick={onReset}
        className="text-caption text-rc-iris-500 focus-visible:ring-button-primary-enabled cursor-pointer rounded-sm font-medium outline-none hover:underline focus-visible:ring-2"
      >
        {RESET_LABEL}
      </button>
    </div>
  );
}

/**
 * 필터 카드. 상태 칩 한 줄과 검색란, 그 아래 문서와 세부 문제 유무 셀렉트, 필터 초기화가 있다.
 * 검색은 Enter 나 돋보기로 확정할 때만 조회하고, 나머지는 고르는 즉시 조회한다.
 */
function FilterBar({
  filters,
  searchDraft,
  documents,
  onSearchDraftChange,
  onChange,
  onReset,
}: {
  filters: QuestionFilters;
  searchDraft: string;
  documents: QuestionLogDocument[];
  onSearchDraftChange: (value: string) => void;
  onChange: (patch: Partial<Omit<QuestionFilters, 'page'>>) => void;
  onReset: () => void;
}) {
  const documentOptions: ConsoleSelectOption[] = documents.map((document) => ({
    value: String(document.documentId),
    label: document.documentTitle,
  }));

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChange({ q: searchDraft.trim() });
  };

  return (
    <div className="border-line-normal bg-background-default flex flex-col gap-2 rounded-xl border px-5 py-4">
      <div className="flex items-center gap-2">
        <p className="text-caption text-label-assistive font-medium">상태</p>
        <Tabs
          value={filters.answerStatus ?? ALL_STATUS}
          onValueChange={(value) =>
            onChange({ answerStatus: value === ALL_STATUS ? undefined : (value as AnswerStatus) })
          }
          className="gap-0"
        >
          <TabsList aria-label="답변 상태">
            {STATUS_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <form role="search" onSubmit={submitSearch} className="relative ml-auto w-70">
          <Input
            type="text"
            aria-label="질문 원문 검색"
            placeholder="질문 원문 검색"
            value={searchDraft}
            maxLength={QUERY_MAX_LENGTH}
            onChange={(event) => onSearchDraftChange(event.target.value)}
            className="text-body-2 pr-9"
          />
          <button
            type="submit"
            aria-label="검색"
            className="text-label-assistive hover:text-label-alternative focus-visible:ring-button-primary-enabled absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer rounded-sm outline-none focus-visible:ring-2"
          >
            <Search aria-hidden className="size-4" />
          </button>
        </form>
      </div>
      <div className="flex items-center gap-2">
        <ConsoleSelect
          aria-label="문서"
          placeholder="문서 전체"
          value={filters.documentId === undefined ? '' : String(filters.documentId)}
          options={documentOptions}
          onValueChange={(value) =>
            onChange({ documentId: value === '' ? undefined : Number(value) })
          }
        />
        <ConsoleSelect
          aria-label="세부 문제 유무"
          placeholder="세부 문제 유무"
          value={filters.subproblemPresence ?? ''}
          options={PRESENCE_OPTIONS}
          onValueChange={(value) =>
            onChange({
              subproblemPresence: value === '' ? undefined : (value as SubproblemPresence),
            })
          }
        />
        <button
          type="button"
          onClick={onReset}
          className="text-caption text-label-assistive hover:text-label-alternative focus-visible:ring-button-primary-enabled ml-auto cursor-pointer rounded-sm font-medium outline-none focus-visible:ring-2"
        >
          {RESET_LABEL}
        </button>
      </div>
    </div>
  );
}

/** 필터를 들고 질문을 조회하는 본문. 필터나 검색어를 바꾸면 1페이지부터 다시 조회하고 필터는 유지한다. */
function QuestionListBody({ group, documents }: QuestionListData) {
  const [filters, setFilters] = useState<QuestionFilters>(INITIAL_FILTERS);
  // 입력 중인 검색어는 Enter 또는 돋보기로 확정하기 전까지 조회 조건과 분리한다.
  const [searchDraft, setSearchDraft] = useState('');

  const fetchQuestions = useCallback(
    async (signal: AbortSignal) => {
      try {
        return await fetchQuestionLogQuestions(group.groupId, toQuery(filters), signal);
      } catch (error) {
        // 서버가 쿼리를 거절하면 잘못된 조건을 반복하지 않고 명세대로 전체 필터로 돌아간다.
        if (error instanceof ConsoleApiError && error.code === 'INVALID_REQUEST') {
          setSearchDraft('');
          setFilters(INITIAL_FILTERS);
        }

        throw error;
      }
    },
    [group.groupId, filters],
  );
  const { state, retry } = useConsoleFetch(fetchQuestions);

  const changeFilters = (patch: Partial<Omit<QuestionFilters, 'page'>>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  const resetFilters = () => {
    setSearchDraft('');
    setFilters(INITIAL_FILTERS);
  };
  const changePage = (page: number) => setFilters((current) => ({ ...current, page }));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <ConsolePageHeader title="질문 목록" description={formatQuestionLogScope(group.name)} />
        <FilterBar
          filters={filters}
          searchDraft={searchDraft}
          documents={documents}
          onSearchDraftChange={setSearchDraft}
          onChange={changeFilters}
          onReset={resetFilters}
        />
      </div>

      <section aria-label="질문" className="flex flex-col gap-2">
        <h2 className="text-headline text-label-strong font-semibold">질문</h2>
        {state.status === 'loading' && <ConsoleLoading message={QUESTIONS_LOADING_MESSAGE} />}
        {state.status === 'failed' && (
          <ConsoleFetchError message={state.error.message} onRetry={retry} />
        )}
        {/* 전체 결과가 없을 때만 빈 상태로 본다. 범위를 벗어난 빈 페이지는 이전으로 돌아갈 수 있게 페이지네이션을 남긴다. */}
        {state.status === 'ready' &&
          (state.data.totalCount === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <QuestionTable
              items={state.data.items}
              footer={
                <Pagination
                  page={state.data.page}
                  totalCount={state.data.totalCount}
                  onPageChange={changePage}
                />
              }
            />
          ))}
      </section>
    </div>
  );
}

/**
 * 질문 목록 화면. 사이드바의 질문 목록과 대시보드 질문 목록 블록의 더보기로 들어온다.
 * 읽기 전용이라 행 클릭, 드로어, 체크박스가 없고 필터와 검색만 동작한다.
 * 들어올 때 질문 로그 조회 대상 그룹과 문서 셀렉트 옵션을 받고, 질문은 필터가 바뀔 때마다 본문이 다시 조회한다.
 */
export default function QuestionListPage() {
  const { state, retry } = useConsoleFetch(fetchQuestionListData);

  if (state.status !== 'ready') {
    return (
      <ConsolePage breadcrumb={BREADCRUMB}>
        <div className="flex flex-col gap-2">
          <ConsolePageHeader title="질문 목록" />
          {state.status === 'loading' ? (
            <ConsoleLoading message={PAGE_LOADING_MESSAGE} />
          ) : (
            <ConsoleFetchError message={state.error.message} onRetry={retry} />
          )}
        </div>
      </ConsolePage>
    );
  }

  return (
    <ConsolePage breadcrumb={BREADCRUMB}>
      {/* 그룹이 없는 경우는 실패가 아니라 조회할 대상이 없는 성공이다. */}
      {state.data === null ? (
        <div className="flex flex-col gap-2">
          <ConsolePageHeader title="질문 목록" />
          <p className="text-label text-label-alternative">{EMPTY_GROUP_MESSAGE}</p>
        </div>
      ) : (
        <QuestionListBody
          key={state.data.group.groupId}
          group={state.data.group}
          documents={state.data.documents}
        />
      )}
    </ConsolePage>
  );
}
