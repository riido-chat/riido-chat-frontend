import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { fetchDocumentGroupDetail, toConsoleApiError } from '@/api/console';
import { Button } from '@/components/common/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/tooltip';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import DocumentUploadDialog from '@/components/console/DocumentUploadDialog';
import GitbookSyncDialog from '@/components/console/GitbookSyncDialog';
import GitbookSyncResultDialog from '@/components/console/GitbookSyncResultDialog';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import ReindexDialog from '@/components/console/ReindexDialog';
import UploadResultDialog from '@/components/console/UploadResultDialog';
import {
  canReindex,
  findGitbookSource,
  formatGroupDescription,
  isJobRunning,
  resolveUploadErrorSurface,
} from '@/lib/console';
import { reindexDocumentGroupMock, syncGitbookMock, uploadDocumentMock } from '@/mocks/console';
import type {
  DocumentGroupDetail,
  DocumentUploadRequest,
  DocumentUploadTarget,
  GitbookSyncOutcome,
  GitbookSyncTarget,
  ReindexStep,
  UploadOutcome,
} from '@/types/console.types';

const LIST_PATH = '/console/document-groups';
const LOADING_MESSAGE = '문서 그룹을 불러오고 있습니다.';

/**
 * 상세 조회의 진행 상태. 그룹이 없는 경우는 다른 실패와 달리 화면 전체 오류로 바꾸므로 따로 둔다.
 * 재조회는 ready 를 유지한 채 이루어지고, 재조회에 실패해도 실행은 이미 끝났으므로 보고 있던 상세를 그대로 둔다.
 */
type DocumentGroupDetailState =
  | { status: 'loading' }
  | { status: 'ready'; detail: DocumentGroupDetail }
  | { status: 'missing' }
  | { status: 'failed'; message: string };

// 주소 표시줄에서 받은 값은 문자열이므로 정수로 바꾸고, 정수가 아니면 없는 그룹으로 본다.
const parseGroupId = (groupId: string | undefined) => {
  const parsed = Number(groupId);

  return groupId !== undefined && Number.isInteger(parsed) ? parsed : null;
};

/** 없는 그룹과 사라진 그룹이 함께 쓰는 화면 전체 오류 */
function MissingGroupPage() {
  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
      <ConsolePageHeader
        title="문서 그룹을 찾을 수 없습니다"
        description="주소가 바뀌었거나 삭제된 문서 그룹입니다"
      />
      <Link to={LIST_PATH} className="text-label text-label-alternative underline">
        문서 그룹 목록으로 돌아가기
      </Link>
    </ConsolePage>
  );
}

export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const parsedGroupId = parseGroupId(groupId);

  if (parsedGroupId === null) {
    return <MissingGroupPage />;
  }

  // 그룹이 바뀌면 조회 상태와 열려 있던 모달을 모두 새로 시작하도록 그룹마다 다른 트리를 만든다.
  return <DocumentGroupDetailLoader key={parsedGroupId} groupId={parsedGroupId} />;
}

/** 상세를 조회해 화면 상태를 정하고, 실행이 끝난 뒤의 재조회를 맡는다. */
function DocumentGroupDetailLoader({ groupId }: { groupId: number }) {
  const [state, setState] = useState<DocumentGroupDetailState>({ status: 'loading' });
  // 재조회와 다시 시도는 같은 조회를 반복하므로, 값을 올려 effect 를 다시 실행시킨다.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchDocumentGroupDetail(groupId, controller.signal)
      .then((detail) => setState({ status: 'ready', detail }))
      .catch((error: unknown) => {
        // 화면을 떠나거나 재조회가 겹쳐 중단한 요청은 실패가 아니므로 상태를 바꾸지 않는다.
        if (controller.signal.aborted) {
          return;
        }

        const failure = toConsoleApiError(error);

        if (failure.code === 'NOT_FOUND') {
          setState({ status: 'missing' });
          return;
        }

        // 재조회 실패는 보고 있던 상세를 그대로 두고, 첫 조회 실패만 오류 화면으로 바꾼다.
        setState((previous) =>
          previous.status === 'ready' ? previous : { status: 'failed', message: failure.message },
        );
      });

    return () => controller.abort();
  }, [groupId, attempt]);

  // 재조회는 화면을 조회 중으로 바꾸지 않고 응답이 오면 상세만 갈아 끼운다.
  const refetch = () => setAttempt((count) => count + 1);

  const retry = () => {
    setState({ status: 'loading' });
    refetch();
  };

  if (state.status === 'missing') {
    return <MissingGroupPage />;
  }

  if (state.status === 'loading') {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리', to: LIST_PATH }]}>
        <p className="text-label text-label-alternative animate-pulse" aria-live="polite">
          {LOADING_MESSAGE}
        </p>
      </ConsolePage>
    );
  }

  if (state.status === 'failed') {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리', to: LIST_PATH }]}>
        <div className="flex flex-col items-start gap-3" role="alert">
          <p className="text-label text-label-normal">{state.message}</p>
          <Button variant="console-secondary" size="md" onClick={retry}>
            다시 시도
          </Button>
        </div>
      </ConsolePage>
    );
  }

  return (
    <DocumentGroupDetailView
      detail={state.detail}
      onRefetch={refetch}
      onGroupMissing={() => setState({ status: 'missing' })}
    />
  );
}

type DocumentGroupDetailViewProps = {
  detail: DocumentGroupDetail;
  /** 실행이 끝나 배경 상세가 바뀌었을 때의 재조회 */
  onRefetch: () => void;
  /** 그룹이 사라진 뒤 도달한 실행은 상세 조회 실패와 같으므로 화면 전체 오류로 바꾼다. */
  onGroupMissing: () => void;
};

/** 조회가 끝난 상세 화면. 업로드, 검색 반영, GitBook 수집 모달을 이 안에서 연다. */
function DocumentGroupDetailView({
  detail,
  onRefetch,
  onGroupMissing,
}: DocumentGroupDetailViewProps) {
  const [uploadTarget, setUploadTarget] = useState<DocumentUploadTarget | null>(null);
  // 다시 업로드는 실패한 원래 모달로 돌아가야 하므로 직전 대상을 남겨 둔다.
  const [failedTarget, setFailedTarget] = useState<DocumentUploadTarget | null>(null);
  const [uploadOutcome, setUploadOutcome] = useState<UploadOutcome | null>(null);
  // 검색 반영은 확인, 잠금, 완료 또는 실패를 한 모달에서 단계로 보인다. null 이면 닫힌 상태다.
  const [reindexStep, setReindexStep] = useState<ReindexStep | null>(null);
  // GitBook 수집은 수집 모달이 수집 중까지 맡고, 응답이 오면 결과 모달로 바꿔 보인다. null 이면 각각 닫힌 상태다.
  const [syncTarget, setSyncTarget] = useState<GitbookSyncTarget | null>(null);
  const [syncOutcome, setSyncOutcome] = useState<GitbookSyncOutcome | null>(null);

  const { group, summary, documents } = detail;
  // 실행 중인 작업이 있으면 실행 버튼을 모두 비활성으로 두고, 비활성 사유는 화면에 나타내지 않는다.
  const isRunning = isJobRunning(detail);
  const isReindexAvailable = canReindex(detail);
  const reindexDisabledMessage = isRunning
    ? '진행 중인 작업이 완료된 후 검색에 반영할 수 있습니다.'
    : summary.searchStatus === 'NO_DOCUMENTS'
      ? '검색에 반영할 문서가 없습니다.'
      : '이미 최신 상태입니다.';

  const handleUploadRevision = (documentId: number) => {
    const targetDocument = documents.find((document) => document.documentId === documentId);

    if (targetDocument) {
      setUploadTarget({
        mode: 'revision',
        documentId: targetDocument.documentId,
        documentTitle: targetDocument.title,
      });
    }
  };

  /**
   * 업로드 실패를 화면으로 나눈다.
   * 문구를 고르는 일은 하지 않고 서버가 내려준 message 를 그대로 오류 모달에 넘기며,
   * code 는 어느 화면에 보일지만 정한다. 어느 경우든 기존 문서와 ACTIVE 색인은 그대로 남는다.
   */
  const handleUploadFailure = (target: DocumentUploadTarget, error: unknown) => {
    const failure = toConsoleApiError(error);

    switch (resolveUploadErrorSurface(failure.code)) {
      case 'page':
        onGroupMissing();
        break;
      case 'refetch':
        // 화면이 낡아서 도달한 경우다. 모달을 두지 않고 상세를 다시 조회해 버튼 활성을 맞춘다.
        onRefetch();
        break;
      default:
        setFailedTarget(target);
        setUploadOutcome({ status: 'failed', message: failure.message });
    }
  };

  /**
   * 검색 반영 시작. 응답이 올 때까지 잠금 모달로 화면 전체를 막고, 응답이 오면 바로 완료나 실패로 넘어간다.
   * 실패 모달의 다시 시도도 별도 엔드포인트 없이 이 호출을 반복한다.
   */
  const handleReindex = async () => {
    setReindexStep({ status: 'running' });

    try {
      const result = await reindexDocumentGroupMock(group.groupId);
      // 성공하면 새 검색 버전이 ACTIVE 가 되고 반영 대기가 없어진다. 확인을 누르기 전에 배경 상세가 갱신되어 있어야 한다.
      onRefetch();
      setReindexStep({ status: 'done', result });
    } catch (error) {
      // 실패 모달은 한 종류이고 본문은 응답의 message 그대로다. 기존 ACTIVE 색인과 검색 코퍼스는 그대로 남는다.
      setReindexStep({ status: 'failed', message: toConsoleApiError(error).message });
    }
  };

  /**
   * GitBook 수집 모달을 연다. 원천이 있으면 저장된 루트 URL 을 읽기 전용으로 보이고, 없으면 입력을 받는다.
   * 오류 모달의 다시 시도도 입력값을 유지하지 않고 이 대상으로 모달을 처음 상태로 다시 연다.
   */
  const openGitbookSync = () => {
    setSyncTarget({ groupId: group.groupId, rootUrl: findGitbookSource(detail)?.rootUrl ?? null });
  };

  /**
   * GitBook 수집 시작. 응답이 올 때까지 수집 모달이 비활성으로 남고, 응답이 오면 결과 모달로 바꿔 보인다.
   * 오류는 code 로 화면을 나누지 않고 모두 오류 모달 하나로 보내며, 본문은 서버가 내려준 message 그대로다.
   * 404 와 409 는 헤더 버튼이 비활성인 정상 흐름에서 도달할 수 없으므로 따로 다루지 않는다.
   */
  const handleGitbookSync = async (sourceUrl: string) => {
    // 열린 모달이 가리키는 그룹에 수집해야 하므로, 현재 상세의 groupId 대신 열 당시 대상을 쓴다.
    const target = syncTarget;

    if (target === null) {
      return;
    }

    try {
      const result = await syncGitbookMock(target.groupId, sourceUrl);
      // 수집이 끝나면 반영 대기가 늘고 문서 표가 바뀌지만, 검색에는 반영되지 않아 검색 반영 상태 뱃지는 그대로다.
      // 결과 모달 뒤의 배경 상세가 갱신되어 있어야 하므로 여기서 다시 조회한다.
      onRefetch();
      setSyncOutcome({ status: 'done', result });
    } catch (error) {
      setSyncOutcome({ status: 'failed', message: toConsoleApiError(error).message });
    } finally {
      setSyncTarget(null);
    }
  };

  const handleUpload = async (request: DocumentUploadRequest) => {
    // 성공이든 실패든 결과 모달로 넘어가므로, 되돌아갈 대상을 미리 붙들어 둔다.
    const target = uploadTarget;

    try {
      const result = await uploadDocumentMock(request);
      // 성공하면 새 판이 잡히고 반영 대기가 하나 늘며 검색 반영 상태가 반영 필요로 바뀐다.
      // 배경 상세는 갱신된 상태로 보여야 하므로 여기서 다시 조회한다.
      onRefetch();
      setUploadOutcome({ status: 'ready', result });
    } catch (error) {
      if (target !== null) {
        handleUploadFailure(target, error);
      }
    } finally {
      setUploadTarget(null);
    }
  };

  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리', to: LIST_PATH }, { label: group.name }]}>
      <ConsolePageHeader
        title={group.name}
        description={formatGroupDescription(group.consumerKey)}
        actions={
          <div className="flex items-start gap-2">
            {/* GitBook 수집은 검색 반영 상태와 무관하게 실행 중인 작업이 있을 때에만 비활성이 된다. */}
            <Button
              variant="console-secondary"
              size="md"
              disabled={isRunning}
              onClick={openGitbookSync}
            >
              GitBook 수집
            </Button>
            <Button
              variant="console-secondary"
              size="md"
              disabled={isRunning}
              onClick={() => setUploadTarget({ mode: 'new', groupId: group.groupId })}
            >
              신규 문서 업로드
            </Button>
            {isReindexAvailable ? (
              <Button
                variant="console-primary"
                size="md"
                onClick={() => setReindexStep({ status: 'confirm' })}
              >
                검색에 반영하기
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="console-primary" size="md" disabled focusableWhenDisabled>
                      검색에 반영하기
                    </Button>
                  }
                />
                <TooltipContent>{reindexDisabledMessage}</TooltipContent>
              </Tooltip>
            )}
          </div>
        }
      />
      <GroupSummaryCard summary={summary} />
      <DocumentTable
        documents={documents}
        isJobRunning={isRunning}
        onUploadRevision={handleUploadRevision}
      />
      {/* 취소나 닫기로 모달만 닫히고 상세 화면은 그대로 유지한다. */}
      <DocumentUploadDialog
        target={uploadTarget}
        onClose={() => setUploadTarget(null)}
        onUpload={handleUpload}
      />
      <UploadResultDialog
        outcome={uploadOutcome}
        onClose={() => setUploadOutcome(null)}
        onReindex={() => {
          // 결과 모달을 닫고 검색 반영 확인 모달로 넘어간다. 반영 대상 버전은 화면에 나열하지 않는다.
          setUploadOutcome(null);
          setReindexStep({ status: 'confirm' });
        }}
        onRetry={() => {
          // 입력값을 유지하지 않고, 실패한 원래 업로드 모달을 처음 상태로 다시 연다.
          setUploadOutcome(null);
          setUploadTarget(failedTarget);
        }}
      />
      <ReindexDialog
        step={reindexStep}
        onClose={() => {
          // 완료의 확인과 실패의 닫기 모두 모달만 닫고, 닫힐 때 상세 재조회 1회를 안전망으로 둔다.
          setReindexStep(null);
          onRefetch();
        }}
        onStart={() => void handleReindex()}
      />
      <GitbookSyncDialog
        target={syncTarget}
        onClose={() => setSyncTarget(null)}
        onSync={handleGitbookSync}
      />
      <GitbookSyncResultDialog
        outcome={syncOutcome}
        onClose={() => {
          // 닫기는 모달만 닫고, 반영 대기가 갱신된 상세가 보이도록 재조회 1회를 안전망으로 둔다.
          setSyncOutcome(null);
          onRefetch();
        }}
        onReindex={() => {
          // 결과 모달을 닫고 검색 반영 확인 모달로 넘어간다.
          setSyncOutcome(null);
          setReindexStep({ status: 'confirm' });
        }}
        onRetry={() => {
          setSyncOutcome(null);
          openGitbookSync();
        }}
      />
    </ConsolePage>
  );
}
