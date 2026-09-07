import type {
  AppliedStatus,
  ConsoleDocument,
  DocumentGroupDetail,
  SearchStatus,
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
