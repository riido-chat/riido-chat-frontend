import type {
  AppliedStatus,
  ChunkStats,
  ConsoleDocument,
  DocumentGroupDetail,
  SearchStatus,
  UploadErrorCode,
} from '@/types/console.types';

// 뱃지와 표에서 쓰는 짧은 라벨. 원시 enum은 화면 문구로 노출하지 않는다.
export const SEARCH_STATUS_LABEL: Record<SearchStatus, string> = {
  UP_TO_DATE: '최신 반영',
  REINDEX_REQUIRED: '반영 필요',
  IN_PROGRESS: '반영 중',
  NO_DOCUMENTS: '문서 없음',
  FAILED: '반영 실패',
};

export const APPLIED_STATUS_LABEL: Record<AppliedStatus, string> = {
  APPLIED: '반영됨',
  UNAPPLIED: '반영 대기',
};

// 문서 그룹의 설명은 API가 따로 내려주지 않기 때문에 consumerKey를 이용해 만들어 낸다.
export const formatGroupDescription = (consumerKey: string) =>
  `${consumerKey} 기능이 사용하는 문서 그룹`;

/**
 * 그룹에 실행 중인 작업이 있는지 판정한다.
 * jobInProgress 가 판정의 근거이고, 검색 반영 상태가 IN_PROGRESS 인 응답도 같은 상황이므로 함께 묶어 둔다.
 */
export const isJobRunning = (detail: DocumentGroupDetail) =>
  detail.jobInProgress || detail.summary.searchStatus === 'IN_PROGRESS';

// 검색 버전은 색인 순번이므로 #을 붙여 표기하고, 색인한 적이 없으면 값이 없음을 나타낸다.
export const formatActiveIndexVersion = (versionNo: number | null) =>
  versionNo === null ? '없음' : `#${versionNo}`;

export const formatPendingCount = (count: number) => (count === 0 ? '없음' : `${count}건`);

export const formatDocumentVersion = (versionNo: number | null) =>
  versionNo === null ? '-' : `v${versionNo}`;

// 검색에 반영하기 버튼을 누를 수 있는 검색 반영 상태
const REINDEXABLE_STATUSES: SearchStatus[] = ['REINDEX_REQUIRED', 'FAILED'];

/**
 * 검색에 반영하기 버튼을 누를 수 있는 상태인지 판정한다.
 * FAILED 는 직전 반영이 실패해서 반영이 필요하다는 뜻을 함께 담고 있으므로 다시 실행할 수 있다.
 */
export const canReindex = (detail: DocumentGroupDetail) =>
  !isJobRunning(detail) && REINDEXABLE_STATUSES.includes(detail.summary.searchStatus);

/** 수정본 업로드는 콘솔에서 올린 UPLOAD 문서에만 허용되고, GitBook 에서 수집한 문서에는 허용되지 않는다. */
export const canUploadRevision = (document: ConsoleDocument, isRunning: boolean) =>
  !isRunning && document.sourceType === 'UPLOAD';
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

/**
 * 문서명은 앞뒤 공백을 제거한 뒤 1자 이상 300자 이하여야 한다.
 * 초과분은 입력란에서 걸러 INVALID_REQUEST 가 정상 흐름에 도달하지 않게 한다.
 */
export const DOCUMENT_TITLE_MAX_LENGTH = 300;

/**
 * 업로드 오류를 어느 화면으로 보낼지 나타내는 구분.
 * dialog 는 오류 모달에 응답의 message 를 그대로 띄우고,
 * page 는 화면 전체 오류로 바꾸며,
 * refetch 는 화면이 낡아서 도달한 경우이므로 상세를 다시 조회해 버튼 활성을 맞춘다.
 */
export type UploadErrorSurface = 'dialog' | 'page' | 'refetch';

const UPLOAD_ERROR_SURFACES: Record<UploadErrorCode, UploadErrorSurface> = {
  DOCUMENT_ALREADY_EXISTS: 'dialog',
  DUPLICATE_CONTENT: 'dialog',
  NO_CHANGE: 'dialog',
  FILE_TOO_LARGE: 'dialog',
  INVALID_FILE: 'dialog',
  INTERNAL_ERROR: 'dialog',
  NOT_FOUND: 'page',
  DOCUMENT_NOT_REVISABLE: 'refetch',
  JOB_IN_PROGRESS: 'refetch',
  INVALID_REQUEST: 'refetch',
};

/**
 * 오류 코드로 화면을 정한다. 문구를 고르는 일은 하지 않고, 어느 화면에 보일지만 판정한다.
 * 명세에 없는 코드가 와도 사용자가 원인을 볼 수 있도록 오류 모달로 떨어뜨린다.
 */
export const resolveUploadErrorSurface = (code: UploadErrorCode): UploadErrorSurface =>
  UPLOAD_ERROR_SURFACES[code] ?? 'dialog';

// 청크 수는 천 단위 구분 기호를 붙여 적는다.
const formatChunkCount = (count: number) => count.toLocaleString('ko-KR');

/**
 * 결과 모달의 청크 통계 한 줄.
 * sectionCount 와 chunkCount 는 화면에 쓰지 않고, chunkStats 의 네 값만 이 한 줄로 보인다.
 */
export const formatChunkStats = ({ added, changed, deleted, reused }: ChunkStats) =>
  `추가 ${formatChunkCount(added)}, 변경 ${formatChunkCount(changed)}, 삭제 ${formatChunkCount(deleted)}, 재사용 ${formatChunkCount(reused)} 청크`;
