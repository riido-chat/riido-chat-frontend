import { ConsoleApiError } from '@/api/console';
import { normalizeSourceUrl } from '@/lib/console';
import type { ConsoleErrorResponse, GitbookSyncResult, ReindexResult } from '@/types/console.types';

/**
 * 조회와 업로드는 실제 API 를 쓰므로 여기에는 검색 반영과 GitBook 수집 목만 남아 있다.
 * 상세 목 데이터가 없어져 그룹이나 문서를 찾아 판정하던 거절은 재현하지 않고, 요청만 보고 판정할 수 있는 거절만 남긴다.
 * 실행이 끝나도 실제 서버는 바뀌지 않으므로, 실행 뒤 재조회로 갱신되는 배경 상세는 그대로다.
 */

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

// 반환 형식을 never 로 적어 두어야 호출한 자리에서 뒤 코드가 실행되지 않는다는 사실이 좁혀진다.
function throwRejection(body: ConsoleErrorResponse): never {
  throw new ConsoleApiError(body);
}

// 서버가 부여하는 ID 는 화면에 쓰이지 않으므로 호출마다 늘어나는 값으로 채운다.
let mockIdSequence = 900;
const nextMockId = () => (mockIdSequence += 1);

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
