import { Badge } from '@/components/common/badge';
import { APPLIED_STATUS_LABEL, SEARCH_STATUS_LABEL } from '@/lib/console';
import type { AppliedStatus, SearchStatus } from '@/types/console.types';

/**
 * 뱃지 톤은 정상에 색을 쓰지 않는다는 원칙을 따른다.
 * 진행(Progress)과 실패(Danger) 톤은 아직 디자인이 확정되지 않아 정상 톤으로 표시한다.
 */
type BadgeTone = 'plain' | 'attention';

const SEARCH_STATUS_TONE: Record<SearchStatus, BadgeTone> = {
  UP_TO_DATE: 'plain',
  REINDEX_REQUIRED: 'attention',
  IN_PROGRESS: 'plain',
  NO_DOCUMENTS: 'plain',
  FAILED: 'plain',
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
