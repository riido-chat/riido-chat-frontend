import type {
  AnswerStatus,
  AppliedStatus,
  ApplyStatus,
  ChunkStats,
  ConsoleDocument,
  DocumentGroupDetail,
  GitbookSyncCounts,
  GitbookSyncResult,
  GroupSource,
  QuestionLogItem,
  ReindexResult,
  SearchStatus,
  WithheldReason,
  WithheldReasonCounts,
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

/**
 * 완료 모달의 검색 버전 한 줄. 직전 ACTIVE 가 있으면 전환을 화살표로 잇고, 첫 반영이면 새 버전만 적는다.
 * 응답에 문서 수와 청크 수가 없으므로 이 한 줄이 완료 모달의 본문 전부다.
 */
export const formatIndexVersionTransition = ({
  indexVersion,
  previousIndexVersion,
}: ReindexResult) => {
  const nextVersion = formatActiveIndexVersion(indexVersion.versionNo);

  return previousIndexVersion === null
    ? `검색 버전 ${nextVersion}`
    : `검색 버전 ${formatActiveIndexVersion(previousIndexVersion.versionNo)} → ${nextVersion}`;
};

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

// 청크 수는 천 단위 구분 기호를 붙여 적는다.
const formatChunkCount = (count: number) => count.toLocaleString('ko-KR');

/**
 * 결과 모달의 청크 통계 한 줄.
 * sectionCount 와 chunkCount 는 화면에 쓰지 않고, chunkStats 의 네 값만 이 한 줄로 보인다.
 */
export const formatChunkStats = ({ added, changed, deleted, reused }: ChunkStats) =>
  `추가 ${formatChunkCount(added)}, 변경 ${formatChunkCount(changed)}, 삭제 ${formatChunkCount(deleted)}, 재사용 ${formatChunkCount(reused)} 청크`;

/**
 * GitBook 수집 모달에 읽기 전용으로 보일 원천을 고른다.
 * 여러 GitBook 은 API 만 허용하고 1차 화면은 원천 하나만 다루므로 첫 GitBook 원천만 쓴다.
 */
export const findGitbookSource = (detail: DocumentGroupDetail): GroupSource | null =>
  detail.sources.find((source) => source.provider === 'GITBOOK') ?? null;

// 서버가 끝 슬래시를 무시하므로 요청 전에 같은 규칙으로 정리해 같은 루트가 같은 원천에 붙게 한다.
export const normalizeSourceUrl = (sourceUrl: string) => sourceUrl.trim().replace(/\/+$/, '');

/**
 * 결과 모달의 대상 한 줄. 루트 URL 은 프로토콜을 떼어 적고 읽어 온 페이지 수를 잇는다.
 * counts.total 은 페이지별 처리 결과 집계의 합이라 숫자 다섯 개와 따로 이 줄에만 보인다.
 */
export const formatGitbookSyncTarget = ({ rootUrl, counts }: GitbookSyncResult) =>
  `${rootUrl.replace(/^https?:\/\//, '')}, ${counts.total.toLocaleString('ko-KR')} 페이지`;

/**
 * 수집 결과 모달에서 검색에 반영하기를 누를 수 있는지 판정한다.
 * 신규, 변경, 제거가 모두 0 이면 반영 대기가 늘지 않았으므로 닫기만 남긴다. 서버는 이 경우에도 요청을 거부하지 않는 FE 규칙이다.
 */
export const hasGitbookSyncChanges = ({ created, updated, removed }: GitbookSyncCounts) =>
  created + updated + removed > 0;

// 값이 없는 칸의 표기. 세부 문제 없음, 해당 없음 같은 문구 대신 하이픈 하나만 적는다.
export const EMPTY_VALUE = '-';

// 질문 로그의 건수 표기. 0 이어도 없음으로 바꾸지 않고 0건으로 적는다.
export const formatQuestionCount = (count: number) => `${count.toLocaleString('ko-KR')}건`;

// 세부 문제는 건이 아니라 개로 센다. 0 이어도 없음으로 바꾸지 않는다.
export const formatSubproblemCount = (count: number) => `${count.toLocaleString('ko-KR')}개`;

// 세부 문제 단위 적용 상태의 뱃지 라벨. 질문 단위 답변 상태 라벨과 섞지 않는다.
export const APPLY_STATUS_LABEL: Record<ApplyStatus, string> = {
  APPLIED: '적용중',
  NEEDS_CANONICAL: '적용 필요',
};

// 대시보드 타일과 질문 목록 배지가 함께 쓰는 보류 사유 라벨. 원시 enum 은 화면에 노출하지 않는다.
export const WITHHELD_REASON_LABEL: Record<keyof WithheldReasonCounts, string> = {
  insufficientEvidence: '근거 부족',
  ambiguousQuestion: '질문 모호',
  outOfScope: '범위 밖',
  unverifiableAnswer: '검증 실패',
};

// 사유 내역은 명세가 정한 순서대로 적으므로 객체 키 순서에 기대지 않는다.
const WITHHELD_REASON_ORDER: (keyof WithheldReasonCounts)[] = [
  'insufficientEvidence',
  'ambiguousQuestion',
  'outOfScope',
  'unverifiableAnswer',
];

/**
 * 답변 불가 타일 아래의 보류 사유 내역 한 줄.
 * 사유를 모르는 보류는 어느 항목에도 들어가지 않아 네 수의 합이 답변 불가 수보다 작을 수 있다.
 */
export const formatWithheldReasonCounts = (counts: WithheldReasonCounts) =>
  WITHHELD_REASON_ORDER.map((reason) => `${WITHHELD_REASON_LABEL[reason]} ${counts[reason]}`).join(
    ' · ',
  );

// 질문 단위 답변 상태의 뱃지 라벨. 보류는 사유를 알 때 아래 함수가 사유를 이어 붙인다.
export const ANSWER_STATUS_LABEL: Record<AnswerStatus, string> = {
  ANSWERED: '답변',
  CACHED_ANSWER: '캐시 답변',
  WITHHELD: '답변 보류',
  ERROR: '오류',
};

// 서버 enum 으로 온 보류 사유를 타일과 같은 라벨로 바꾼다.
const WITHHELD_REASON_ENUM_LABEL: Record<WithheldReason, string> = {
  INSUFFICIENT_EVIDENCE: WITHHELD_REASON_LABEL.insufficientEvidence,
  AMBIGUOUS_QUESTION: WITHHELD_REASON_LABEL.ambiguousQuestion,
  OUT_OF_SCOPE: WITHHELD_REASON_LABEL.outOfScope,
  UNVERIFIABLE_ANSWER: WITHHELD_REASON_LABEL.unverifiableAnswer,
};

/**
 * 답변 상태 뱃지 한 줄. 한 행에 뱃지는 하나만 붙이므로 보류 사유도 뱃지 안에 적는다.
 * 사유를 모르는 보류는 답변 보류 로만 적는다.
 */
export const formatAnswerStatusLabel = ({
  answerStatus,
  withheldReason,
}: Pick<QuestionLogItem, 'answerStatus' | 'withheldReason'>) =>
  answerStatus === 'WITHHELD' && withheldReason !== null
    ? `보류 - ${WITHHELD_REASON_ENUM_LABEL[withheldReason]}`
    : ANSWER_STATUS_LABEL[answerStatus];

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * 질문 시각의 상대 표기. 서버는 UTC ISO 문자열만 주므로 표기는 화면이 만든다.
 * 일주일 안은 상대 시각으로, 그 밖은 날짜로 적어 표 폭 84 안에 들어가게 한다.
 */
export const formatRelativeTime = (isoString: string, now = Date.now()) => {
  const asked = new Date(isoString);
  const elapsed = now - asked.getTime();

  if (elapsed < MINUTE_MS) return '방금 전';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}분 전`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}시간 전`;

  const days = Math.floor(elapsed / DAY_MS);

  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;

  return asked.toLocaleDateString('ko-KR', {
    year: asked.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

// 상대 시각 셀의 title 에 두는 절대 시각. 표에는 상대 표기만 보인다.
export const formatAbsoluteTime = (isoString: string) =>
  new Date(isoString).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
