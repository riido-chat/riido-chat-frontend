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

// 그룹이 문서를 끌어오는 수집 원천. 콘솔에서 직접 올린 문서는 원천이 없으므로 여기에 포함되지 않는다.
export type GroupSource = {
  groupSourceId: number;
  provider: SourceProvider;
  rootUrl: string;
  enabled: boolean;
  documentCount: number;
};

export type ActiveIndexVersion = {
  indexVersionId: number;
  // 화면에 검색 버전으로 나타내는 색인 순번
  versionNo: number;
};

// 상세 조회의 요약 영역. 요약 카드가 그대로 가져다 쓴다.
export type SearchIndexSummary = {
  // ACTIVE 색인. 아직 색인한 적이 없으면 null이다.
  activeIndexVersion: ActiveIndexVersion | null;
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
