import { Badge } from '@/components/common/badge';
import { DOCUMENT_PROCESS_STATUS_LABEL, SEARCH_INDEX_STATUS_LABEL } from '@/lib/console';
import type { DocumentProcessStatus, SearchIndexStatus } from '@/types/console.types';

/**
 * 뱃지 톤은 정상에 색을 쓰지 않는다는 원칙을 따른다.
 * 진행(Progress)과 실패(Danger) 톤은 아직 디자인이 확정되지 않아 정상 톤으로 표시한다.
 */
type BadgeTone = 'plain' | 'attention';

const SEARCH_INDEX_STATUS_TONE: Record<SearchIndexStatus, BadgeTone> = {
  UP_TO_DATE: 'plain',
  REINDEX_REQUIRED: 'attention',
  BUILDING: 'plain',
  VALIDATING: 'plain',
  APPLYING: 'plain',
  FAILED: 'plain',
  EMPTY: 'plain',
};

const DOCUMENT_PROCESS_STATUS_TONE: Record<DocumentProcessStatus, BadgeTone> = {
  READY: 'plain',
  PROCESSING: 'plain',
  FAILED: 'plain',
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
