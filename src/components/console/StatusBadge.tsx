import { Badge } from '@/components/common/badge';
import { DOCUMENT_PROCESS_STATUS_LABEL, SEARCH_INDEX_STATUS_LABEL } from '@/lib/console';
import type { DocumentProcessStatus, SearchIndexStatus } from '@/types/console.types';

/**
 * 뱃지 톤은 정상에 색을 쓰지 않고, 면을 채우거나 dot 을 붙이지 않는다는 설계 원칙을 따른다.
 * 디자인이 함께 정의한 Warning 톤은 예비용이라 아직 대응하는 상태가 없다.
 */
type BadgeTone = 'plain' | 'progress' | 'attention' | 'danger';

const SEARCH_INDEX_STATUS_TONE: Record<SearchIndexStatus, BadgeTone> = {
  UP_TO_DATE: 'plain',
  REINDEX_REQUIRED: 'attention',
  IN_PROGRESS: 'progress',
  // 문서가 없는 상태는 실패가 아니라 아직 아무것도 담기지 않은 상태이므로 정상 톤으로 둔다.
  NO_DOCUMENTS: 'plain',
};

const DOCUMENT_PROCESS_STATUS_TONE: Record<DocumentProcessStatus, BadgeTone> = {
  SUCCESS: 'plain',
  PROCESSING: 'progress',
  FAILED: 'danger',
};

/** 문서 그룹의 검색 반영 상태 뱃지. 원시 enum은 hover 툴팁으로만 병기한다. */
export function SearchIndexStatusBadge({ status }: { status: SearchIndexStatus }) {
  return (
    <Badge variant={SEARCH_INDEX_STATUS_TONE[status]} title={status}>
      {SEARCH_INDEX_STATUS_LABEL[status]}
    </Badge>
  );
}

/** 문서 한 건의 처리 상태 뱃지 */
export function DocumentProcessStatusBadge({ status }: { status: DocumentProcessStatus }) {
  return (
    <Badge variant={DOCUMENT_PROCESS_STATUS_TONE[status]} title={status}>
      {DOCUMENT_PROCESS_STATUS_LABEL[status]}
    </Badge>
  );
}
