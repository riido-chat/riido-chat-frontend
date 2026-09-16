// 문서 그룹의 검색 반영 상태. 원시 enum은 화면 문구로 노출하지 않고 사전을 통해 한국어 라벨로 바꾼다.
export type SearchStatus =
  'UP_TO_DATE' | 'REINDEX_REQUIRED' | 'IN_PROGRESS' | 'NO_DOCUMENTS' | 'FAILED';

// 문서를 어디에서 가져왔는지 구분하는 원천 유형. 수정본 업로드는 UPLOAD 문서에만 허용된다.
export type DocumentSourceType = 'UPLOAD' | 'GITBOOK';

// 문서를 끌어오는 수집 원천의 제공처
export type SourceProvider = 'GITBOOK';

// 문서의 최신 판이 ACTIVE 색인에 들어 있는지를 서버가 계산해서 내려주는 값
export type AppliedStatus = 'APPLIED' | 'UNAPPLIED';

// 목록 조회와 상세 조회가 함께 쓰는 문서 그룹 기본 정보
export type DocumentGroup = {
  groupId: number;
  // 문서 그룹을 가리키는 문자열 키
  groupKey: string;
  name: string;
  // 이 그룹을 사용하는 기능의 식별자. 표시 라벨로 바꾸는 일은 프런트엔드가 맡는다.
  consumerKey: string;
};

// 목록 조회가 돌려주는 문서 그룹 한 건
export type DocumentGroupSummary = DocumentGroup & {
  // 사용 가능한 상태이면서 준비가 끝난 판을 가진 문서의 수
  documentCount: number;
  // ACTIVE 색인의 검색 버전 번호. ACTIVE 색인이 아직 없으면 null이다.
  activeIndexVersionNo: number | null;
  searchStatus: SearchStatus;
};

// 목록 조회 응답. 그룹이 없으면 빈 배열로 200 이 온다.
export type DocumentGroupListResponse = {
  groups: DocumentGroupSummary[];
};

// 그룹이 문서를 끌어오는 수집 원천. 콘솔에서 직접 올린 문서는 원천이 없으므로 여기에 포함되지 않는다.
export type GroupSource = {
  groupSourceId: number;
  provider: SourceProvider;
  rootUrl: string;
  enabled: boolean;
  documentCount: number;
};

// 검색 버전 한 건을 가리키는 값. 요약의 ACTIVE 색인과 검색 반영 응답의 전후 버전이 같은 형태를 쓴다.
export type IndexVersion = {
  indexVersionId: number;
  // 화면에 검색 버전으로 나타내는 색인 순번
  versionNo: number;
};

// 상세 조회의 요약 영역. 요약 카드가 그대로 가져다 쓴다.
export type SearchIndexSummary = {
  // ACTIVE 색인. 아직 색인한 적이 없으면 null이다.
  activeIndexVersion: IndexVersion | null;
  // 반영 대기 건수. 문서 가운데 appliedStatus 가 UNAPPLIED 인 문서의 수이다.
  pendingCount: number;
  searchStatus: SearchStatus;
};

export type ConsoleDocument = {
  // 문서 원본 ID. 수정본 업로드의 대상을 지정할 때 쓴다.
  documentId: number;
  // 그룹 안에서 문서를 가리키는 키. GitBook 문서는 원천 루트 기준 상대 경로이다.
  documentKey: string;
  title: string;
  sourceType: DocumentSourceType;
  // 어느 수집 원천에서 왔는지 나타낸다. 콘솔에서 올린 문서는 null이다.
  groupSourceId: number | null;
  // 준비가 끝난 가장 최근 판의 번호
  documentVersionNo: number;
  // ACTIVE 색인에 들어 있는 그 문서의 판 번호. ACTIVE 색인에 없으면 null이다.
  appliedVersionNo: number | null;
  appliedStatus: AppliedStatus;
};

// 상세 조회가 돌려주는 문서 그룹 한 건
export type DocumentGroupDetail = {
  group: DocumentGroup;
  sources: GroupSource[];
  summary: SearchIndexSummary;
  documents: ConsoleDocument[];
  // 그룹에 실행 중인 작업이 있는지 나타낸다. 업로드와 검색 반영과 GitBook 수집이 그룹 잠금을 공유한다.
  jobInProgress: boolean;
};

// 업로드 모달의 동작 구분. 신규 업로드와 수정본 업로드는 하나의 모달을 mode 로만 나눈다.
export type DocumentUploadMode = 'new' | 'revision';

/**
 * 업로드 모달이 여는 대상. 신규 업로드는 그룹을, 수정본 업로드는 문서 원본을 경로로 잡는다.
 * 두 엔드포인트가 경로와 필드를 다르게 받기 때문에 mode 로 갈라 두어야
 * 문서명이 없는 수정본 대상이나 문서 원본이 없는 신규 대상이 만들어지지 않는다.
 */
export type DocumentUploadTarget =
  | { mode: 'new'; groupId: number }
  | { mode: 'revision'; documentId: number; documentTitle: string };

/**
 * 업로드 요청. multipart/form-data 로 보내는 필드와 경로를 정하는 값만 담는다.
 * 수정본 업로드는 title 을 보내지 않으므로 요청 형태에도 문서명을 두지 않는다.
 */
export type DocumentUploadRequest =
  | { mode: 'new'; groupId: number; file: File; title: string }
  | { mode: 'revision'; documentId: number; file: File };

// 새 판을 만들면서 청크가 어떻게 바뀌었는지 나타내는 집계
export type ChunkStats = {
  added: number;
  changed: number;
  deleted: number;
  reused: number;
};

/**
 * 업로드 성공 응답. 신규 업로드와 수정본 업로드가 같은 형태를 돌려주고 null 이 되는 필드가 없다.
 * versionNo 는 신규 업로드에서 항상 1 이고, 수정본 업로드에서 2 이상이다.
 */
export type DocumentUploadResult = {
  // 로그와 지원 문의 추적에만 쓰는 값이므로 화면에 표시하지 않는다.
  ingestionRunId: number;
  documentId: number;
  documentVersionId: number;
  versionNo: number;
  sectionCount: number;
  chunkCount: number;
  chunkStats: ChunkStats;
};

/**
 * 업로드 두 엔드포인트가 내려주는 오류 코드.
 * DOCUMENT_ALREADY_EXISTS 는 신규 업로드에만, NO_CHANGE 와 DOCUMENT_NOT_REVISABLE 은 수정본 업로드에만 나온다.
 */
export type UploadErrorCode =
  // 오류 모달에 message 를 그대로 띄우는 코드
  | 'DOCUMENT_ALREADY_EXISTS'
  | 'DUPLICATE_CONTENT'
  | 'NO_CHANGE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE'
  | 'INTERNAL_ERROR'
  // 정상 흐름에서는 버튼이 비활성이라 도달하지 않는 방어용 코드
  | 'NOT_FOUND'
  | 'DOCUMENT_NOT_REVISABLE'
  | 'JOB_IN_PROGRESS'
  | 'INVALID_REQUEST';

/**
 * 검색 반영 엔드포인트가 내려주는 오류 코드.
 * 처리 중 실패는 원인을 가리지 않고 INTERNAL_ERROR 하나로 내려오며, 원인은 서버 로그에만 남는다.
 */
export type ReindexErrorCode = 'INTERNAL_ERROR';

/**
 * GitBook 수집 엔드포인트가 내려주는 오류 코드.
 * 페이지 하나가 실패해도 배치는 멈추지 않고 200 의 failures 로 오므로, 거절 넷과 본문을 읽을 수 없을 때의 대비책 하나뿐이다.
 */
export type GitbookSyncErrorCode =
  // 접수 전 거절. 명세는 필드 아래 도움말로 정했지만 그 화면은 추후 사항이라 아직 오류 모달로 보인다.
  | 'INVALID_REQUEST'
  | 'SOURCE_LIST_FAILED'
  // 정상 흐름에서는 버튼이 비활성이라 도달하지 않으므로 화면에서 따로 다루지 않는 코드
  | 'NOT_FOUND'
  | 'JOB_IN_PROGRESS'
  // 오류 본문을 읽지 못했을 때 오류 모달에 띄우는 대비책
  | 'INTERNAL_ERROR';

export type ConsoleErrorCode = UploadErrorCode | ReindexErrorCode | GitbookSyncErrorCode;

/**
 * 접수 전 거절과 접수 뒤 실패가 함께 쓰는 오류 응답.
 * 화면에 보이는 문장은 message 그대로이고, code 는 어느 화면에 보일지만 정한다.
 */
export type ConsoleErrorResponse = {
  code: ConsoleErrorCode;
  message: string;
};

/**
 * 업로드가 끝난 결과. 성공은 신규와 수정본이 공유하는 한 종류이고, 실패도 오류 모달 한 종류다.
 * 모든 실행이 동기라서 진행 상태나 단계가 없고, 결과가 정해진 뒤에만 이 값이 만들어진다.
 */
export type UploadOutcome =
  | { status: 'ready'; result: DocumentUploadResult }
  // 화면에 보이는 문장은 응답의 message 그대로다.
  | { status: 'failed'; message: string };

/**
 * 검색 반영 성공 응답. ACTIVE 전환까지 마친 뒤에 돌아온다.
 * 진행 단계와 문서 수와 청크 수는 응답에 없으므로 완료 모달은 검색 버전 번호만 쓴다.
 */
export type ReindexResult = {
  // 로그와 지원 문의 추적에만 쓰는 값이므로 화면에 표시하지 않는다.
  indexRunId: number;
  // 이번에 ACTIVE 가 된 검색 버전
  indexVersion: IndexVersion;
  // 이번에 INACTIVE 가 된 직전 ACTIVE 검색 버전. 첫 반영이면 null 이다.
  previousIndexVersion: IndexVersion | null;
};

/**
 * 검색 반영 모달의 단계. 확인에서 시작해 잠금을 거쳐 완료나 실패로 끝난다.
 * 실행이 동기라 잠금 단계에는 진행률이 없고, 실패에서 다시 시도하면 잠금으로 되돌아간다.
 */
export type ReindexStep =
  | { status: 'confirm' }
  | { status: 'running' }
  | { status: 'done'; result: ReindexResult }
  // 화면에 보이는 문장은 응답의 message 그대로다.
  | { status: 'failed'; message: string };

/**
 * GitBook 수집 모달이 여는 대상.
 * 원천이 있으면 상세 조회의 rootUrl 을 읽기 전용으로 보이고, 없으면 null 이라 루트 URL 을 입력으로 받는다.
 * 여러 GitBook 은 API 만 허용하고 1차 화면은 원천 하나만 다루므로 다른 URL 입력 자체를 막는다.
 */
export type GitbookSyncTarget = {
  groupId: number;
  rootUrl: string | null;
};

/**
 * 페이지별 처리 결과 집계. created + updated + noChange + failed = total 이고,
 * removed 는 이번 목록에 없어 enabled=false 로 바뀐 문서 수라 total 에 들어가지 않는다.
 */
export type GitbookSyncCounts = {
  // 읽어 온 페이지 수
  total: number;
  created: number;
  updated: number;
  noChange: number;
  removed: number;
  failed: number;
};

/** 실패한 페이지 한 건. 실패가 없으면 failures 는 빈 배열이다. */
export type GitbookSyncFailure = {
  // 요청 루트 기준 상대 경로
  documentKey: string;
  title: string;
  // 실패 행을 개별로 지목하는 데 쓰는 실행 ID
  ingestionRunId: number;
  // 목록 행에 들어가는 축약 문장. 오류 모달의 message 와 달리 행 폭에 맞춘 짧은 문장이다.
  message: string;
};

/**
 * GitBook 수집 성공 응답. 페이지 목록 조회와 페이지별 처리를 모두 요청 안에서 끝낸 뒤 돌아온다.
 * batchId, groupId, status, stage, startedAt, finishedAt 은 응답에 없다.
 */
export type GitbookSyncResult = {
  // 이번 수집이 붙은 원천. 같은 루트로 다시 부르면 같은 값이 온다. 화면에는 쓰지 않는다.
  groupSourceId: number;
  rootUrl: string;
  counts: GitbookSyncCounts;
  failures: GitbookSyncFailure[];
};

/**
 * GitBook 수집이 끝난 결과. 페이지 단위 실패는 200 의 counts.failed 로 집계되므로 done 안에 들어 있고,
 * failed 는 요청 자체가 거절되거나 본문을 읽지 못한 경우의 오류 모달이다.
 */
export type GitbookSyncOutcome =
  | { status: 'done'; result: GitbookSyncResult }
  // 화면에 보이는 문장은 응답의 message 그대로다.
  | { status: 'failed'; message: string };

/**
 * 답변 보류 사유별 건수. 대시보드 타일과 질문 목록 배지가 같은 네 가지 사유를 쓴다.
 * 사유를 모르는 보류도 있어 네 값의 합이 unanswerableCount 보다 작을 수 있다.
 */
export type WithheldReasonCounts = {
  // 근거 부족 (INSUFFICIENT_EVIDENCE)
  insufficientEvidence: number;
  // 질문 모호 (AMBIGUOUS_QUESTION)
  ambiguousQuestion: number;
  // 범위 밖 (OUT_OF_SCOPE)
  outOfScope: number;
  // 검증 실패 (UNVERIFIABLE_ANSWER)
  unverifiableAnswer: number;
};

/** 자주 묻는 세부 문제 한 줄. 질문 수 내림차순으로 최대 5개가 온다. */
export type FrequentSubproblem = {
  // 펼침 조회와 질문 목록 필터에 쓰는 세부 문제 ID
  subproblemId: string;
  // 분류 당시가 아닌 현재 이름
  name: string;
  // 세부 문제가 속한 문서. 이 그룹 문서가 아니면 null 이다.
  documentId: number | null;
  // 문서 제목. 제목이 비어 있으면 문서 키가 온다.
  documentTitle: string | null;
  // 현재 분류가 이 세부 문제인 질문 수
  questionCount: number;
};

/** 답변 보류가 많은 문서 한 줄. 근거 부족 수 내림차순으로 최대 5개가 온다. */
export type WithheldDocument = {
  documentId: number;
  documentTitle: string;
  // 이 문서로 귀속된 근거 부족 보류 건수. 화면의 근거 부족 N건이다.
  insufficientEvidenceCount: number;
};

/**
 * 질문 로그 대시보드 응답. 기간 없이 전체 누적으로 집계한 값이다.
 * 턴이 없으면 수치는 0, 목록은 빈 배열로 200 이 오므로 빈 상태 표기는 화면이 정한다.
 */
export type QuestionLogDashboard = {
  // 대상 턴 수. COMPLETED, WITHHELD, ERROR 턴만 센다.
  questionCount: number;
  // 답변 불가. WITHHELD 턴 수이며 오류는 넣지 않는다.
  unanswerableCount: number;
  withheldReasonCounts: WithheldReasonCounts;
  frequentSubproblems: FrequentSubproblem[];
  withheldDocuments: WithheldDocument[];
};

/**
 * 질문 한 건의 답변 상태. 질문 단위 상태는 이 네 갈래이고 세부 문제 단위 상태와 섞지 않는다.
 * WITHHELD 는 사유를 가리지 않으며 사유는 withheldReason 에 따로 온다.
 */
export type AnswerStatus = 'ANSWERED' | 'CACHED_ANSWER' | 'WITHHELD' | 'ERROR';

// 답변 보류 사유. answerStatus 가 WITHHELD 이고 사유가 이 넷 중 하나일 때만 값이 있다.
export type WithheldReason =
  'INSUFFICIENT_EVIDENCE' | 'AMBIGUOUS_QUESTION' | 'OUT_OF_SCOPE' | 'UNVERIFIABLE_ANSWER';

/** 질문 목록의 한 행. 최신순으로 정렬되어 오며 정렬 파라미터는 없다. */
export type QuestionLogItem = {
  // 턴 ID. 행 키로만 쓰고 화면에 표시하지 않는다.
  ragRunId: string;
  // 질문 표시값. 재작성 질문이 있으면 그것이 우선이라 사용자가 친 문장과 다를 수 있다.
  question: string;
  // 귀속 문서. 문서 없음이나 분류 없음이면 null 이다.
  documentId: number | null;
  documentTitle: string | null;
  // 현재 분류의 세부 문제. 분류가 없으면 null 이다.
  subproblemId: string | null;
  subproblemName: string | null;
  // 질문 시각. UTC ISO 8601 이고 Z 로 끝나며, 상대 시각 표기는 화면이 만든다.
  askedAt: string;
  answerStatus: AnswerStatus;
  withheldReason: WithheldReason | null;
};

/**
 * 질문 목록 조회의 쿼리. 필터는 모두 AND 로 묶이고 이름은 camelCase 다.
 * 대시보드 미리보기는 size 만 쓰고, 나머지는 질문 목록 화면과 세부 문제 펼침이 쓴다.
 */
export type QuestionLogQuery = {
  answerStatus?: AnswerStatus;
  documentId?: number;
  // ABSENT 는 분류 없는 질문까지 포함하며 subproblemId 와 함께 줄 수 없다.
  subproblemPresence?: 'PRESENT' | 'ABSENT';
  subproblemId?: string;
  // 검색어. 100자 이하이고 앞뒤 공백을 걷어 비면 검색하지 않는다.
  q?: string;
  // 1 이상. 기본 1
  page?: number;
  // 1 이상 100 이하. 기본 20
  size?: number;
};

/** 질문 목록 응답. 결과가 없거나 마지막 페이지를 넘으면 items 는 빈 배열이고 totalCount 는 그대로다. */
export type QuestionLogPage = {
  items: QuestionLogItem[];
  page: number;
  size: number;
  // 필터와 검색을 적용한 뒤 전체 건수
  totalCount: number;
};

/** 문서 한 건의 질문 로그 수치. 질문이 1건 이상이거나 보관되지 않은 세부 문제가 1개 이상인 문서만 온다. */
export type QuestionLogDocument = {
  // 문서 원본 ID. 문서 상세 조회와 질문 목록 필터에 쓴다.
  documentId: number;
  // 문서 제목. 제목이 비어 있으면 문서 키가 온다.
  documentTitle: string;
  // 이 문서로 귀속된 질문 수
  questionCount: number;
  // 그중 WITHHELD 턴 수. 사유는 가리지 않는다.
  withheldCount: number;
  // ARCHIVED 가 아닌 세부 문제 수
  subproblemCount: number;
};

/**
 * 문서 목록 응답. 페이지 없이 전체 행이 질문 수 내림차순으로 온다.
 * 대시보드 미리보기는 앞 3행만 보이고, 질문 목록의 문서 셀렉트 옵션으로도 쓴다.
 */
export type QuestionLogDocumentList = {
  items: QuestionLogDocument[];
  // 분류 행은 있지만 이 그룹 문서로 귀속되지 않은 질문 수. 화면 행으로 쓰지 않는다.
  noDocumentQuestionCount: number;
  // 분류 행이 없는 질문 수. 판별 스위치가 꺼져 있던 턴이 여기에 든다. 화면 행으로 쓰지 않는다.
  unclassifiedQuestionCount: number;
};
