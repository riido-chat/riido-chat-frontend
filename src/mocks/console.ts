import { ConsoleApiError } from '@/api/console';
import { isMarkdownFileName, normalizeSourceUrl } from '@/lib/console';
import type {
  ConsoleErrorResponse,
  DocumentUploadRequest,
  DocumentUploadResult,
  GitbookSyncResult,
  ReindexResult,
} from '@/types/console.types';

/**
 * 목록 조회와 상세 조회는 실제 API 를 쓰므로 여기에는 실행 엔드포인트 목만 남아 있다.
 * 상세 목 데이터가 없어져 그룹이나 문서를 찾아 판정하던 거절은 재현하지 않고, 요청만 보고 판정할 수 있는 거절만 남긴다.
 * 실행이 끝나도 실제 서버는 바뀌지 않으므로, 실행 뒤 재조회로 갱신되는 배경 상세는 그대로다.
 */

// 파일 조건은 두 엔드포인트가 같다. 초과분은 접수 전 거절이므로 실행도 원본도 만들어지지 않는다.
const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;

// 임베딩까지 마친 응답이 도착할 때까지 이어지는 전송 중 상태를 지연으로 재현한다.
const MOCK_UPLOAD_DELAY_MS = 1500;

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

// 반환 형식을 never 로 적어 두어야 호출한 자리에서 뒤 코드가 실행되지 않는다는 사실이 좁혀진다.
function throwRejection(body: ConsoleErrorResponse): never {
  throw new ConsoleApiError(body);
}

/**
 * 문서명을 정규화해 문서 키를 만든다. 서버가 맡는 규칙이므로 목이 쓸 수 있는 문자가 남는지 판정할 때에만 쓴다.
 * 한글은 완성형만 남기고, 명세에 적힌 순서대로 공백을 하이픈으로 바꾼 뒤 허용 문자를 거른다.
 */
const normalizeDocumentTitle = (title: string) =>
  title
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/[^a-z0-9가-힣-]/g, '');

/**
 * 파일 조건 검증. 어긋나면 접수 전 거절이다.
 * UTF-8 여부는 본문을 읽어야 판정할 수 있으므로 목에서는 다루지 않는다.
 */
function findFileRejection(file: File): ConsoleErrorResponse | null {
  if (!isMarkdownFileName(file.name)) {
    return {
      code: 'INVALID_FILE',
      message: '.md 확장자의 Markdown 파일만 업로드할 수 있습니다.',
    };
  }

  if (file.size === 0) {
    return {
      code: 'INVALID_FILE',
      message: '빈 Markdown 파일은 업로드할 수 없습니다.',
    };
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    return { code: 'FILE_TOO_LARGE', message: '파일 용량이 5MB 를 넘습니다.' };
  }

  return null;
}

// 서버가 부여하는 ID 는 화면에 쓰이지 않으므로 호출마다 늘어나는 값으로 채운다.
let mockIdSequence = 900;
const nextMockId = () => (mockIdSequence += 1);

/** 청킹 결과는 파일마다 다르지만 화면 확인에는 개수만 필요하므로 고정된 집계로 돌려준다. */
const buildUploadResult = (documentId: number, versionNo: number): DocumentUploadResult => ({
  ingestionRunId: nextMockId(),
  documentId,
  documentVersionId: nextMockId(),
  versionNo,
  sectionCount: 2,
  chunkCount: 2,
  chunkStats: { added: 2, changed: 0, deleted: 0, reused: 0 },
});

/**
 * 신규 문서 업로드 목. 요청만 보고 판정할 수 있는 파일 조건과 문서명 조건만 다룬다.
 * 같은 이름 판정(DOCUMENT_ALREADY_EXISTS)과 본문 해시 판정(DUPLICATE_CONTENT)은 서버 데이터가 필요해 재현하지 않는다.
 */
async function uploadNewDocumentMock(
  _groupId: number,
  file: File,
  title: string,
): Promise<DocumentUploadResult> {
  await delay(MOCK_UPLOAD_DELAY_MS);

  const fileRejection = findFileRejection(file);

  if (fileRejection !== null) {
    throwRejection(fileRejection);
  }

  if (normalizeDocumentTitle(title) === '') {
    throwRejection({
      code: 'INVALID_FILE',
      message: '문서명에 사용할 수 있는 문자가 없습니다.',
    });
  }

  // 신규 업로드는 항상 새 문서와 첫 판을 만들기 때문에 versionNo 가 언제나 1 이다.
  return buildUploadResult(nextMockId(), 1);
}

/**
 * 수정본 업로드 목. 파일 조건만 판정한다.
 * 대상 문서를 찾아야 하는 NOT_FOUND 와 DOCUMENT_NOT_REVISABLE, 직전 판과 비교해야 하는 NO_CHANGE 는 재현하지 않는다.
 */
async function uploadDocumentRevisionMock(
  documentId: number,
  file: File,
): Promise<DocumentUploadResult> {
  await delay(MOCK_UPLOAD_DELAY_MS);

  const fileRejection = findFileRejection(file);

  if (fileRejection !== null) {
    throwRejection(fileRejection);
  }

  // 직전 판 번호를 알 수 없으므로, 수정본이 만드는 가장 이른 판 번호로 돌려준다.
  return buildUploadResult(documentId, 2);
}

/**
 * 업로드 API 목. 실제 API 와 요청 형태와 응답 형태가 같으므로,
 * 백엔드가 준비되면 이 호출을 api/console 의 uploadDocument 로 바꾸기만 하면 된다.
 */
export function uploadDocumentMock(request: DocumentUploadRequest) {
  return request.mode === 'new'
    ? uploadNewDocumentMock(request.groupId, request.file, request.title)
    : uploadDocumentRevisionMock(request.documentId, request.file);
}

// 조합 확정과 임베딩 확인과 코퍼스 교체까지 마친 뒤 응답하므로, 업로드보다 긴 지연으로 잠금 모달을 재현한다.
const MOCK_REINDEX_DELAY_MS = 2500;

// 목이 이어 가는 검색 버전 번호. 실제 상세의 검색 버전과는 무관하며 호출마다 하나씩 늘어난다.
let mockActiveVersionNo = 12;

/**
 * 검색 반영 API 목. 명세의 오류는 처리 중 실패 하나뿐이고 목에서는 재현할 원인이 없으므로 항상 성공한다.
 * 상세 목 데이터가 없어 직전 ACTIVE 는 목이 이어 가는 번호로 채운다.
 */
export async function reindexDocumentGroupMock(groupId: number): Promise<ReindexResult> {
  // 실제 API 와 같은 형태를 유지할 뿐, 상세 목 데이터가 없어 그룹으로 판정하는 일은 없다.
  void groupId;

  await delay(MOCK_REINDEX_DELAY_MS);

  const previousIndexVersion = { indexVersionId: nextMockId(), versionNo: mockActiveVersionNo };
  mockActiveVersionNo += 1;

  return {
    indexRunId: nextMockId(),
    indexVersion: { indexVersionId: nextMockId(), versionNo: mockActiveVersionNo },
    previousIndexVersion,
  };
}

// 페이지 목록 조회와 페이지별 처리를 모두 요청 안에서 끝내므로, 운영 실측 (40 페이지 5.2초) 에 가까운 지연으로 수집 중 모달을 재현한다.
const MOCK_GITBOOK_SYNC_DELAY_MS = 3000;

// 목이 아는 GitBook 은 발표 데이터의 원천 하나뿐이다. 다른 루트는 llms.txt 를 읽지 못한 것으로 본다.
const MOCK_GITBOOK_ROOT_URL = 'https://docs.riido.io';

// 목이 읽어 오는 페이지 수. 명세의 응답 예시와 같은 값이다.
const MOCK_GITBOOK_PAGE_COUNT = 41;

/**
 * GitBook 수집 API 목. 요청만 보고 판정할 수 있는 요청 검증(422)과 목록 조회(502)만 재현한다.
 * 그룹 조회(404)와 진행 중 작업 검사(409)는 상세 목 데이터가 없어 재현하지 않는다.
 * 결과는 명세의 응답 예시 그대로 같은 루트로 다시 부른 재수집이며, 페이지 하나가 실패해도 배치는 계속 진행해 200 으로 집계한다.
 */
export async function syncGitbookMock(
  _groupId: number,
  sourceUrl: string,
): Promise<GitbookSyncResult> {
  await delay(MOCK_GITBOOK_SYNC_DELAY_MS);

  const rootUrl = normalizeSourceUrl(sourceUrl);

  if (!rootUrl.startsWith('https://')) {
    throwRejection({ code: 'INVALID_REQUEST', message: 'https 주소만 입력할 수 있습니다.' });
  }

  if (rootUrl !== MOCK_GITBOOK_ROOT_URL) {
    throwRejection({
      code: 'SOURCE_LIST_FAILED',
      message: 'GitBook 페이지 목록을 읽지 못했습니다. 다시 시도하거나 GitBook 을 확인해 주세요.',
    });
  }

  return {
    groupSourceId: 1,
    rootUrl,
    counts: {
      total: MOCK_GITBOOK_PAGE_COUNT,
      created: 1,
      updated: 3,
      noChange: 36,
      removed: 1,
      failed: 1,
    },
    failures: [
      {
        documentKey: 'sprints/automations',
        title: '스프린트 자동화',
        ingestionRunId: nextMockId(),
        message: '문서 내용을 처리할 수 없습니다.',
      },
    ],
  };
}
