import type {
  ConsoleErrorResponse,
  DocumentUploadRequest,
  DocumentUploadResult,
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
 * 업로드 엔드포인트가 내려준 오류를 그대로 담는 오류 객체.
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
 * 업로드 두 엔드포인트가 요청 형태와 응답 형태를 공유하므로 전송과 오류 변환을 한곳에 모은다.
 * 임베딩까지 끝낸 뒤에 응답이 오는 동기 실행이라 진행률을 받을 자리가 없다.
 */
async function postUpload(path: string, body: FormData): Promise<DocumentUploadResult> {
  // Content-Type 은 브라우저가 boundary 와 함께 붙이므로 직접 지정하지 않는다.
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', body });

  if (!response.ok) {
    // 본문이 code 와 message 로 오지 않는 경우는 애플리케이션에 닿기 전에 게이트웨이가 끊은 때다.
    // 5MB 를 넘는 요청을 웹 서버가 먼저 413 HTML 로 거절하는 경우가 여기에 해당한다.
    const errorBody: ConsoleErrorResponse | null = await response.json().catch(() => null);
    throw new ConsoleApiError(errorBody ?? FALLBACK_ERROR);
  }

  return response.json();
}

/**
 * 신규 문서 업로드. 성공하면 항상 새 문서와 첫 판이 만들어지고 versionNo 는 1 이다.
 * 문서명 정규화와 앞뒤 공백 제거는 서버가 맡고, 파일명은 요청에 쓰이지 않는다.
 */
export function uploadNewDocument(groupId: number, file: File, title: string) {
  const body = new FormData();
  body.append('file', file);
  body.append('title', title);

  return postUpload(`/api/admin/document-groups/${groupId}/documents`, body);
}

/**
 * 수정본 업로드. 대상이 경로의 documentId 로 고정이라 문서명을 바꿀 수 없으므로 title 을 보내지 않는다.
 * title 을 함께 보내면 서버가 422 로 거절한다.
 */
export function uploadDocumentRevision(documentId: number, file: File) {
  const body = new FormData();
  body.append('file', file);

  return postUpload(`/api/admin/documents/${documentId}/versions`, body);
}

/** 업로드 모달이 만든 요청을 mode 에 따라 두 엔드포인트로 나눈다. */
export function uploadDocument(request: DocumentUploadRequest) {
  return request.mode === 'new'
    ? uploadNewDocument(request.groupId, request.file, request.title)
    : uploadDocumentRevision(request.documentId, request.file);
}
