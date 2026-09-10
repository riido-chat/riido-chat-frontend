import { ConsoleApiError } from '@/api/console';
import { findGitbookSource, isMarkdownFileName, normalizeSourceUrl } from '@/lib/console';
import type {
  ConsoleErrorResponse,
  DocumentGroupDetail,
  DocumentGroupSummary,
  DocumentUploadRequest,
  DocumentUploadResult,
  GitbookSyncResult,
  ReindexResult,
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

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

// 반환 형식을 never 로 적어 두어야 호출한 자리에서 뒤 코드가 실행되지 않는다는 사실이 좁혀진다.
function throwRejection(body: ConsoleErrorResponse): never {
  throw new ConsoleApiError(body);
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
    throwRejection({ code: 'NOT_FOUND', message: '존재하지 않는 문서 그룹입니다.' });
  }

  const fileRejection = findFileRejection(file);

  if (fileRejection !== null) {
    throwRejection(fileRejection);
  }

  const normalizedTitle = normalizeDocumentTitle(title);

  if (normalizedTitle === '') {
    throwRejection({
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
    throwRejection({ code: 'NOT_FOUND', message: '존재하지 않는 문서입니다.' });
  }

  if (target.sourceType === 'GITBOOK') {
    throwRejection({
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

// 조합 확정과 임베딩 확인과 코퍼스 교체까지 마친 뒤 응답하므로, 업로드보다 긴 지연으로 잠금 모달을 재현한다.
const MOCK_REINDEX_DELAY_MS = 2500;

/**
 * 검색 반영 API 목. 명세의 오류는 처리 중 실패 하나뿐이고 목에서는 재현할 원인이 없으므로 항상 성공한다.
 * 상세 조회 API 가 없어 목 데이터는 바꾸지 않으며, 배경 상세 갱신은 상세 조회를 붙일 때 재조회로 맡긴다.
 */
export async function reindexDocumentGroupMock(groupId: number): Promise<ReindexResult> {
  await delay(MOCK_REINDEX_DELAY_MS);

  const detail = documentGroupDetails.find((it) => it.group.groupId === groupId);

  // 상세 화면이 없는 그룹에서는 버튼에 닿을 수 없으므로, 명세에 있는 유일한 오류로 처리 중 실패를 흉내 낸다.
  if (detail === undefined) {
    throwRejection({ code: 'INTERNAL_ERROR', message: '다시 시도해 주세요.' });
  }

  const previousIndexVersion = detail.summary.activeIndexVersion;

  return {
    indexRunId: nextMockId(),
    indexVersion: {
      indexVersionId: nextMockId(),
      versionNo: (previousIndexVersion?.versionNo ?? 0) + 1,
    },
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
 * GitBook 수집 API 목. 거절 검사 순서는 명세대로 요청 검증, 그룹 조회, 진행 중 작업 검사, 목록 조회다.
 * 진행 중 작업이 있으면 목록을 읽지 않으므로 409 가 502 보다 먼저 나온다.
 * 상세 조회 API 가 없어 목 데이터는 바꾸지 않으며, 배경 상세 갱신은 상세 조회를 붙일 때 재조회로 맡긴다.
 */
export async function syncGitbookMock(
  groupId: number,
  sourceUrl: string,
): Promise<GitbookSyncResult> {
  await delay(MOCK_GITBOOK_SYNC_DELAY_MS);

  const rootUrl = normalizeSourceUrl(sourceUrl);

  if (!rootUrl.startsWith('https://')) {
    throwRejection({ code: 'INVALID_REQUEST', message: 'https 주소만 입력할 수 있습니다.' });
  }

  const detail = documentGroupDetails.find((it) => it.group.groupId === groupId);

  if (detail === undefined) {
    throwRejection({ code: 'NOT_FOUND', message: '존재하지 않는 문서 그룹입니다.' });
  }

  if (detail.jobInProgress) {
    throwRejection({
      code: 'JOB_IN_PROGRESS',
      message: '다른 작업이 진행 중입니다. 완료 후 다시 실행할 수 있습니다.',
    });
  }

  if (rootUrl !== MOCK_GITBOOK_ROOT_URL) {
    throwRejection({
      code: 'SOURCE_LIST_FAILED',
      message: 'GitBook 페이지 목록을 읽지 못했습니다. 다시 시도하거나 GitBook 을 확인해 주세요.',
    });
  }

  const existingSource = findGitbookSource(detail);

  // 원천이 아직 없는 그룹은 첫 수집이라 모든 페이지가 신규이고, 사라진 페이지와 실패는 없다.
  if (existingSource === null) {
    return {
      groupSourceId: nextMockId(),
      rootUrl,
      counts: {
        total: MOCK_GITBOOK_PAGE_COUNT,
        created: MOCK_GITBOOK_PAGE_COUNT,
        updated: 0,
        noChange: 0,
        removed: 0,
        failed: 0,
      },
      failures: [],
    };
  }

  // 같은 루트로 다시 부른 재수집. 명세의 응답 예시 그대로 페이지 하나가 실패해도 배치는 계속 진행해 200 으로 집계한다.
  return {
    groupSourceId: existingSource.groupSourceId,
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
