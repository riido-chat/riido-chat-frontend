import { Badge } from '@/components/common/badge';
import { APPLIED_STATUS_LABEL, SEARCH_STATUS_LABEL } from '@/lib/console';
import type { AppliedStatus, SearchStatus } from '@/types/console.types';

// 운영콘솔 상태 뱃지가 쓰는 톤. warning 은 아직 문서 관리 화면에 쓰이는 상태가 없다.
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
