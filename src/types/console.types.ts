// 문서 그룹의 검색 반영 상태. 원시 enum은 화면 문구로 노출하지 않고 사전을 통해 한국어 라벨로 바꾼다.
export type SearchIndexStatus = 'UP_TO_DATE' | 'REINDEX_REQUIRED' | 'IN_PROGRESS' | 'NO_DOCUMENTS';

// 문서 한 건의 처리 상태
export type DocumentProcessStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';

export type DocumentGroupSummary = {
  id: string;
  name: string;
  // 이 문서 그룹을 사용하는 기능의 식별자 (예: HELP_CHATBOT)
  feature: string;
  documentCount: number;
  searchIndexStatus: SearchIndexStatus;
  // 챗봇이 현재 사용하는 색인 순번. 아직 색인한 적이 없으면 null이다.
  searchIndexVersion: number | null;
};

export type ConsoleDocument = {
  id: string;
  name: string;
  documentVersion: number;
  // 검색에 반영된 버전. 반영된 적이 없으면 null이다.
  indexedVersion: number | null;
  processStatus: DocumentProcessStatus;
};

export type DocumentGroupDetail = DocumentGroupSummary & {
  description: string;
  documents: ConsoleDocument[];
};

// 업로드 모달의 동작 구분. 신규 업로드와 수정본 업로드는 하나의 모달을 mode 로만 나눈다.
export type DocumentUploadMode = 'new' | 'revision';
