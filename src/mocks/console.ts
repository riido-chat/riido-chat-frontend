import { ConsoleApiError } from '@/api/console';
import { isMarkdownFileName } from '@/lib/console';
import type {
  ConsoleErrorResponse,
  DocumentGroupDetail,
  DocumentGroupSummary,
  DocumentUploadRequest,
  DocumentUploadResult,
} from '@/types/console.types';

export const documentGroupDetails: DocumentGroupDetail[] = [
  {
    group: {
      groupId: 1,
      groupKey: 'HELP_CHATBOT',
      name: '도움말 챗봇 이용가이드',
      consumerKey: 'HELP_CHATBOT',
    },
    sources: [
      {
        groupSourceId: 1,
        provider: 'GITBOOK',
        rootUrl: 'https://docs.riido.io',
        enabled: true,
        documentCount: 1,
      },
    ],
    summary: {
      activeIndexVersion: { indexVersionId: 57, versionNo: 12 },
      pendingCount: 2,
      searchStatus: 'REINDEX_REQUIRED',
    },
    documents: [
      {
        documentId: 101,
        documentKey: 'upload/이용가이드',
        title: '이용가이드',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 4,
        appliedVersionNo: 3,
        appliedStatus: 'UNAPPLIED',
      },
      {
        documentId: 102,
        documentKey: 'upload/자주-묻는-질문',
        title: '자주 묻는 질문',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 2,
        appliedVersionNo: 2,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 7,
        documentKey: 'policies/service-policy',
        title: '서비스 정책 안내',
        sourceType: 'GITBOOK',
        groupSourceId: 1,
        documentVersionNo: 1,
        appliedVersionNo: 1,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 104,
        documentKey: 'upload/2026-상반기-릴리즈-노트',
        title: '2026년 상반기 기능 업데이트 및 릴리즈 노트 모음 (v1 개정판, 운영팀 검수 완료본)',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 4,
        appliedVersionNo: 3,
        appliedStatus: 'UNAPPLIED',
      },
    ],
    jobInProgress: false,
  },
  {
    group: {
      groupId: 2,
      groupKey: 'POLICY_CHATBOT',
      name: '서비스 정책 안내',
      consumerKey: 'POLICY_CHATBOT',
    },
    sources: [],
    summary: {
      activeIndexVersion: { indexVersionId: 41, versionNo: 8 },
      pendingCount: 0,
      searchStatus: 'UP_TO_DATE',
    },
    documents: [
      {
        documentId: 201,
        documentKey: 'upload/이용약관',
        title: '이용약관',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 3,
        appliedVersionNo: 3,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 202,
        documentKey: 'upload/개인정보-처리방침',
        title: '개인정보 처리방침',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 2,
        appliedVersionNo: 2,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 203,
        documentKey: 'upload/환불-및-취소-정책',
        title: '환불 및 취소 정책',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 1,
        appliedVersionNo: 1,
        appliedStatus: 'APPLIED',
      },
    ],
    jobInProgress: false,
  },
];

/**
 * 목록 조회는 별도의 API이지만, 목 데이터끼리 어긋나지 않도록 상세 목 데이터에서 만들어 낸다.
 * 상세의 문서 표에는 목록의 문서 수와 같은 기준으로 걸러진 문서만 들어 있다.
 */
export const documentGroups: DocumentGroupSummary[] = documentGroupDetails.map((detail) => ({
  ...detail.group,
  documentCount: detail.documents.length,
  activeIndexVersionNo: detail.summary.activeIndexVersion?.versionNo ?? null,
  searchStatus: detail.summary.searchStatus,
}));

// 주소 표시줄에서 받은 값은 문자열이므로 숫자로 바꾸어 문서 그룹을 찾는다.
export const findDocumentGroupDetail = (groupId: string | undefined) => {
  const parsedGroupId = Number(groupId);

  if (groupId === undefined || !Number.isInteger(parsedGroupId)) {
    return null;
  }

  return documentGroupDetails.find((detail) => detail.group.groupId === parsedGroupId) ?? null;
};

// 파일 조건은 두 엔드포인트가 같다. 초과분은 접수 전 거절이므로 실행도 원본도 만들어지지 않는다.
const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;

// 임베딩까지 마친 응답이 도착할 때까지 이어지는 전송 중 상태를 지연으로 재현한다.
const MOCK_UPLOAD_DELAY_MS = 1500;

// 목이 돌려주는 오류. 실제 응답과 같은 code 와 message 에 HTTP 상태만 덧붙인다.
type MockRejection = ConsoleErrorResponse & { status: number };

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

// 반환 형식을 never 로 적어 두어야 호출한 자리에서 뒤 코드가 실행되지 않는다는 사실이 좁혀진다.
function throwRejection({ status, ...body }: MockRejection): never {
  throw new ConsoleApiError(body, status);
}

/**
 * 문서명을 정규화해 문서 키를 만든다. 서버가 맡는 규칙이므로 목이 같은 이름 재업로드를 판정할 때에만 쓴다.
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
function findFileRejection(file: File): MockRejection | null {
  if (!isMarkdownFileName(file.name)) {
    return {
      status: 422,
      code: 'INVALID_FILE',
      message: '.md 확장자의 Markdown 파일만 업로드할 수 있습니다.',
    };
  }

  if (file.size === 0) {
    return {
      status: 422,
      code: 'INVALID_FILE',
      message: '빈 Markdown 파일은 업로드할 수 없습니다.',
    };
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    return { status: 413, code: 'FILE_TOO_LARGE', message: '파일 용량이 5MB 를 넘습니다.' };
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
 * 신규 문서 업로드 목. 확정된 판정 가운데 목 데이터로 재현할 수 있는 것만 다룬다.
 * 본문 해시를 계산하지 않기 때문에 DUPLICATE_CONTENT 는 재현하지 않는다.
 */
async function uploadNewDocumentMock(
  groupId: number,
  file: File,
  title: string,
): Promise<DocumentUploadResult> {
  await delay(MOCK_UPLOAD_DELAY_MS);

  const detail = documentGroupDetails.find((it) => it.group.groupId === groupId);

  if (detail === undefined) {
    throwRejection({ status: 404, code: 'NOT_FOUND', message: '존재하지 않는 문서 그룹입니다.' });
  }

  const fileRejection = findFileRejection(file);

  if (fileRejection !== null) {
    throwRejection(fileRejection);
  }

  const normalizedTitle = normalizeDocumentTitle(title);

  if (normalizedTitle === '') {
    throwRejection({
      status: 422,
      code: 'INVALID_FILE',
      message: '문서명에 사용할 수 있는 문자가 없습니다.',
    });
  }

  // 같은 키의 콘솔 문서에 준비된 판이 있으면 새 판은 수정본 업로드로만 만들 수 있다.
  const isTitleTaken = detail.documents.some(
    (document) =>
      document.sourceType === 'UPLOAD' && document.documentKey === `upload/${normalizedTitle}`,
  );

  if (isTitleTaken) {
    throwRejection({
      status: 409,
      code: 'DOCUMENT_ALREADY_EXISTS',
      message:
        '같은 이름의 문서가 이미 있습니다. 수정본 업로드를 사용하거나 다른 이름을 입력해 주세요.',
    });
  }

  // 신규 업로드는 항상 새 문서와 첫 판을 만들기 때문에 versionNo 가 언제나 1 이다.
  return buildUploadResult(nextMockId(), 1);
}

/**
 * 수정본 업로드 목. 대상은 sourceType 이 UPLOAD 이고 준비된 판이 있는 문서뿐이다.
 * 직전 판과의 본문 해시 비교가 필요한 NO_CHANGE 는 목 데이터로 재현하지 않는다.
 */
async function uploadDocumentRevisionMock(
  documentId: number,
  file: File,
): Promise<DocumentUploadResult> {
  await delay(MOCK_UPLOAD_DELAY_MS);

  const target = documentGroupDetails
    .flatMap((detail) => detail.documents)
    .find((document) => document.documentId === documentId);

  if (target === undefined) {
    throwRejection({ status: 404, code: 'NOT_FOUND', message: '존재하지 않는 문서입니다.' });
  }

  if (target.sourceType === 'GITBOOK') {
    throwRejection({
      status: 409,
      code: 'DOCUMENT_NOT_REVISABLE',
      message: 'GitBook 문서에는 수정본을 올릴 수 없습니다.',
    });
  }

  const fileRejection = findFileRejection(file);

  if (fileRejection !== null) {
    throwRejection(fileRejection);
  }

  return buildUploadResult(target.documentId, target.documentVersionNo + 1);
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
