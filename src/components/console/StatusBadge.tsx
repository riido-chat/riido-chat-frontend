import { Badge } from '@/components/common/badge';
import {
  APPLIED_STATUS_LABEL,
  APPLY_STATUS_LABEL,
  formatAnswerStatusLabel,
  SEARCH_STATUS_LABEL,
} from '@/lib/console';
import type {
  AnswerStatus,
  AppliedStatus,
  ApplyStatus,
  QuestionLogItem,
  SearchStatus,
} from '@/types/console.types';

// 운영콘솔 상태 뱃지가 쓰는 톤. warning 은 질문 로그의 답변 보류에 쓴다.
type BadgeTone = 'plain' | 'progress' | 'attention' | 'warning' | 'danger';

// 문서가 없는 상태는 조치할 일이 없어서 정상 톤을 유지한다.
const SEARCH_STATUS_TONE: Record<SearchStatus, BadgeTone> = {
  UP_TO_DATE: 'plain',
  REINDEX_REQUIRED: 'attention',
  IN_PROGRESS: 'progress',
  NO_DOCUMENTS: 'plain',
  FAILED: 'danger',
};

const APPLIED_STATUS_TONE: Record<AppliedStatus, BadgeTone> = {
  APPLIED: 'plain',
  UNAPPLIED: 'attention',
};

/** 문서 그룹의 검색 반영 상태 뱃지. 원시 enum은 hover 툴팁으로만 병기한다. */
export function SearchStatusBadge({ status }: { status: SearchStatus }) {
  return (
    <Badge variant={SEARCH_STATUS_TONE[status]} title={status}>
      {SEARCH_STATUS_LABEL[status]}
    </Badge>
  );
}

/** 문서 한 건의 반영 여부 뱃지. 아직 반영되지 않은 문서만 주의 톤으로 구분해서 보여준다. */
export function AppliedStatusBadge({ status }: { status: AppliedStatus }) {
  return (
    <Badge variant={APPLIED_STATUS_TONE[status]} title={status}>
      {APPLIED_STATUS_LABEL[status]}
    </Badge>
  );
}

// 세부 문제 적용 상태의 톤. 승인 정본이 있으면 진행 톤, 정본이 필요하면 주의 톤이다.
const APPLY_STATUS_TONE: Record<ApplyStatus, BadgeTone> = {
  APPLIED: 'progress',
  NEEDS_CANONICAL: 'attention',
};

/** 세부 문제 한 건의 적용 상태 뱃지. 적용중과 적용 필요 두 가지뿐이다. */
export function ApplyStatusBadge({ status }: { status: ApplyStatus }) {
  return (
    <Badge variant={APPLY_STATUS_TONE[status]} title={status}>
      {APPLY_STATUS_LABEL[status]}
    </Badge>
  );
}

// 답변 상태의 톤. 정상 답변은 색이 없고, 캐시 답변은 진행, 보류는 예비, 오류는 실패 톤을 쓴다.
const ANSWER_STATUS_TONE: Record<AnswerStatus, BadgeTone> = {
  ANSWERED: 'plain',
  CACHED_ANSWER: 'progress',
  WITHHELD: 'warning',
  ERROR: 'danger',
};

/** 질문 한 건의 답변 상태 뱃지. 보류 사유는 별도 줄이 아니라 뱃지 문구 안에 함께 적는다. */
export function AnswerStatusBadge({
  answerStatus,
  withheldReason,
}: Pick<QuestionLogItem, 'answerStatus' | 'withheldReason'>) {
  return (
    <Badge variant={ANSWER_STATUS_TONE[answerStatus]} title={withheldReason ?? answerStatus}>
      {formatAnswerStatusLabel({ answerStatus, withheldReason })}
    </Badge>
  );
}
