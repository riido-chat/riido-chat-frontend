import type {
  ConsoleErrorResponse,
  DocumentGroupListResponse,
  DocumentUploadRequest,
  DocumentUploadResult,
  GitbookSyncResult,
  ReindexResult,
} from '@/types/console.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * 오류 본문을 읽지 못했을 때 세우는 기본값.
 * 서버가 그 외 전부에 쓰는 INTERNAL_ERROR 와 같은 문장이므로, 전송이 끊긴 경우도 같은 자리에서 다룰 수 있다.
 */
const FALLBACK_ERROR: ConsoleErrorResponse = {
  code: 'INTERNAL_ERROR',
  message: '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

/**
 * 파싱에 성공한 본문이 서버가 정한 오류 형태인지 확인한다.
 * 게이트웨이가 자기 형식으로 내려준 JSON 은 파싱을 통과하면서도 code 와 message 를 갖고 있지 않은데,
 * 타입 표기는 런타임에 남지 않으므로 두 값을 직접 확인해야 문구가 빈 오류 모달을 막을 수 있다.
 */
const toErrorResponse = (body: unknown): ConsoleErrorResponse | null => {
  const { code, message } = (body ?? {}) as Partial<ConsoleErrorResponse>;

  return typeof code === 'string' && typeof message === 'string' ? { code, message } : null;
};

/**
 * 콘솔 엔드포인트가 내려준 오류를 그대로 담는 오류 객체.
 * 화면 문구는 message 를 그대로 쓰고, code 는 어느 화면에 보일지만 정한다.
 */
export class ConsoleApiError extends Error {
  readonly code: ConsoleErrorResponse['code'];

  constructor({ code, message }: ConsoleErrorResponse) {
    super(message);
    this.name = 'ConsoleApiError';
    this.code = code;
  }
}

/**
 * 전송이 끊겨 응답을 받지 못한 경우까지 서버 오류와 같은 형태로 맞춘다.
 * 호출하는 쪽이 오류 종류를 가리지 않고 code 하나로 화면을 나눌 수 있게 해 준다.
 */
export const toConsoleApiError = (error: unknown) =>
  error instanceof ConsoleApiError ? error : new ConsoleApiError(FALLBACK_ERROR);

/**
 * 콘솔 엔드포인트가 오류 형태를 공유하므로 응답 판정과 오류 변환을 한곳에 모은다.
 * 성공 본문은 그대로 돌려주고, 실패 본문은 code 와 message 를 갖춘 경우에만 그대로 쓴다.
 */
async function readConsoleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // 본문이 code 와 message 로 오지 않는 경우는 애플리케이션에 닿기 전에 게이트웨이가 끊은 때다.
    // 5MB 를 넘는 요청을 웹 서버가 먼저 413 HTML 로 거절하거나, 게이트웨이가 형태가 다른 JSON 을 내려주는 경우가 여기에 해당한다.
    const errorBody = toErrorResponse(await response.json().catch(() => null));
    throw new ConsoleApiError(errorBody ?? FALLBACK_ERROR);
  }

  return response.json();
}

/**
 * 콘솔의 조회 엔드포인트. 화면을 떠나면 응답을 버릴 수 있도록 signal 을 받는다.
 * 중단된 요청은 fetch 가 AbortError 로 거절하므로, 호출한 쪽이 그 경우만 걸러 내면 된다.
 */
async function getConsole<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'GET', signal });

  return readConsoleResponse<T>(response);
}

// 업로드는 multipart 로, GitBook 수집은 JSON 으로 보내고, 검색 반영은 본문이 없다.
type ConsoleRequestBody = FormData | Record<string, unknown>;

/**
 * 콘솔의 실행 엔드포인트.
 * 업로드는 임베딩까지, 검색 반영은 ACTIVE 전환까지, GitBook 수집은 페이지별 처리까지 끝낸 뒤에 응답이 오는 동기 실행이라
 * 진행률을 받을 자리가 없다.
 */
async function postConsole<T>(path: string, body?: ConsoleRequestBody): Promise<T> {
  // FormData 의 Content-Type 은 브라우저가 boundary 와 함께 붙이므로 JSON 본문에만 직접 지정한다.
  const isJsonBody = body !== undefined && !(body instanceof FormData);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: isJsonBody ? { 'Content-Type': 'application/json' } : undefined,
    body: isJsonBody ? JSON.stringify(body) : body,
  });

  return readConsoleResponse<T>(response);
}

/**
 * 문서 그룹 목록 조회. 그룹마다 문서 수, 검색 버전, 검색 반영 상태를 서버가 계산해서 내려준다.
 * 문서 수는 enabled 이고 READY 판이 있는 문서만 센 값이므로 화면에서 다시 세지 않는다. 그룹이 없으면 빈 배열이다.
 */
export async function fetchDocumentGroups(signal?: AbortSignal) {
  const { groups } = await getConsole<DocumentGroupListResponse>(
    '/api/admin/document-groups',
    signal,
  );

  return groups;
}

/**
 * 신규 문서 업로드. 성공하면 항상 새 문서와 첫 판이 만들어지고 versionNo 는 1 이다.
 * 문서명 정규화와 앞뒤 공백 제거는 서버가 맡고, 파일명은 요청에 쓰이지 않는다.
 */
export function uploadNewDocument(groupId: number, file: File, title: string) {
  const body = new FormData();
  body.append('file', file);
  body.append('title', title);

  return postConsole<DocumentUploadResult>(`/api/admin/document-groups/${groupId}/documents`, body);
}

/**
 * 수정본 업로드. 대상이 경로의 documentId 로 고정이라 문서명을 바꿀 수 없으므로 title 을 보내지 않는다.
 * title 을 함께 보내면 서버가 422 로 거절한다.
 */
export function uploadDocumentRevision(documentId: number, file: File) {
  const body = new FormData();
  body.append('file', file);

  return postConsole<DocumentUploadResult>(`/api/admin/documents/${documentId}/versions`, body);
}

/** 업로드 모달이 만든 요청을 mode 에 따라 두 엔드포인트로 나눈다. */
export function uploadDocument(request: DocumentUploadRequest) {
  return request.mode === 'new'
    ? uploadNewDocument(request.groupId, request.file, request.title)
    : uploadDocumentRevision(request.documentId, request.file);
}

/**
 * 검색 반영 시작. 최신 READY 판 조합으로 새 검색 버전을 만들고 검증한 뒤 ACTIVE 로 전환한다.
 * Request Body 가 없고, 다시 시도도 별도 엔드포인트 없이 이 호출을 반복한다.
 */
export function reindexDocumentGroup(groupId: number) {
  return postConsole<ReindexResult>(`/api/admin/document-groups/${groupId}/reindex`);
}

/**
 * GitBook 수집 시작. 루트 URL 의 페이지 목록과 본문을 읽어 페이지마다 콘솔 업로드와 같은 규칙을 적용하는 배치를 돌린다.
 * 같은 루트로 다시 부르는 것이 곧 재수집이고, 새 루트를 주면 원천이 하나 더 만들어진다.
 * 페이지 하나가 실패해도 배치는 계속 진행해 200 의 failures 로 알리므로, 오류 응답은 목록 조회 전 거절뿐이다.
 */
export function syncGitbook(groupId: number, sourceUrl: string) {
  return postConsole<GitbookSyncResult>(`/api/admin/document-groups/${groupId}/gitbook-sync`, {
    sourceUrl,
  });
}
