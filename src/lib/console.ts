import type {
  ConsoleDocument,
  DocumentGroupDetail,
  DocumentProcessStatus,
  SearchIndexStatus,
} from '@/types/console.types';

// 뱃지와 표에서 쓰는 짧은 라벨. 원시 enum은 화면 문구로 노출하지 않는다.
export const SEARCH_INDEX_STATUS_LABEL: Record<SearchIndexStatus, string> = {
  UP_TO_DATE: '최신 반영',
  REINDEX_REQUIRED: '반영 필요',
  BUILDING: '생성 중',
  VALIDATING: '검증 중',
  APPLYING: '반영 중',
  FAILED: '반영 실패',
  EMPTY: '문서 없음',
};

export const DOCUMENT_PROCESS_STATUS_LABEL: Record<DocumentProcessStatus, string> = {
  PROCESSING: '처리 중',
  READY: '준비 완료',
  FAILED: '처리 실패',
};

// 검색 반영 작업이 실행 중인 상태
const IN_PROGRESS_STATUSES: SearchIndexStatus[] = ['BUILDING', 'VALIDATING', 'APPLYING'];

export const isSearchIndexInProgress = (status: SearchIndexStatus) =>
  IN_PROGRESS_STATUSES.includes(status);

// 문서 버전이 검색 반영 버전보다 높으면 반영 대기 상태이다. 아직 반영된 적이 없는 신규 문서도 포함한다.
export const isReindexPending = (document: ConsoleDocument) =>
  document.indexedVersion === null || document.documentVersion > document.indexedVersion;

export const countPendingDocuments = (documents: ConsoleDocument[]) =>
  documents.filter(isReindexPending).length;

// 검색 버전은 색인 순번이므로 #을 붙여 표기하고, 색인한 적이 없으면 값이 없음을 나타낸다.
export const formatSearchIndexVersion = (version: number | null) =>
  version === null ? '없음' : `#${version}`;

export const formatPendingCount = (count: number) => (count === 0 ? '없음' : `${count}건`);

export const formatDocumentVersion = (version: number | null) =>
  version === null ? '-' : `v${version}`;

/**
 * 검색에 반영하기 버튼을 누를 수 있는 상태인지 판정한다.
 * REINDEX_REQUIRED 이면서 반영 대기 중인 READY 문서가 있을 때에만 재색인을 시작할 수 있다.
 */
export const canReindex = (group: DocumentGroupDetail): boolean => {
  if (isSearchIndexInProgress(group.searchIndexStatus)) {
    return false;
  }

  if (group.searchIndexStatus === 'UP_TO_DATE') {
    return false;
  }

  return group.documents.some(
    (document) => document.processStatus === 'READY' && isReindexPending(document),
  );
};
