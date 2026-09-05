import type {
  ConsoleDocument,
  DocumentGroupDetail,
  DocumentProcessStatus,
  SearchIndexStatus,
} from '@/types/console.types';

// 검색 반영 상태
export const SEARCH_INDEX_STATUS_LABEL: Record<SearchIndexStatus, string> = {
  UP_TO_DATE: '최신 반영',
  REINDEX_REQUIRED: '반영 필요',
  IN_PROGRESS: '진행 중',
  NO_DOCUMENTS: '문서 없음',
};

export const DOCUMENT_PROCESS_STATUS_LABEL: Record<DocumentProcessStatus, string> = {
  PROCESSING: '처리 중',
  SUCCESS: '준비 완료',
  FAILED: '처리 실패',
};

// 검색 반영 작업이 실행 중이면 신규 업로드와 재색인 시작을 함께 막는다.
export const isSearchIndexInProgress = (status: SearchIndexStatus) => status === 'IN_PROGRESS';

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
 * 반영이 필요한 그룹에서 반영 대기 중인 준비 완료 문서가 있을 때에만 재색인을 시작할 수 있다.
 */
export const canReindex = (group: DocumentGroupDetail): boolean =>
  group.searchIndexStatus === 'REINDEX_REQUIRED' &&
  group.documents.some(
    (document) => document.processStatus === 'SUCCESS' && isReindexPending(document),
  );

// 1차 지원 형식은 Markdown 뿐이다.
export const MARKDOWN_EXTENSION = '.md';

export const isMarkdownFileName = (fileName: string) =>
  fileName.toLowerCase().endsWith(MARKDOWN_EXTENSION);

// 문서명은 화면 표시용 이름이므로 파일명에서 확장자를 제외한 값을 기본값으로 쓴다.
export const stripFileExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '');

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

// 선택한 파일의 용량 표기. 1KB 이상은 소수 첫째 자리까지 적는다.
export const formatFileSize = (bytes: number) => {
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return unitIndex === 0 ? `${size} B` : `${size.toFixed(1)} ${FILE_SIZE_UNITS[unitIndex]}`;
};
