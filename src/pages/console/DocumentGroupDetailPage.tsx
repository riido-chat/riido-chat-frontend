import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { toConsoleApiError } from '@/api/console';
import { Button } from '@/components/common/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/tooltip';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import DocumentUploadDialog from '@/components/console/DocumentUploadDialog';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import ReindexDialog from '@/components/console/ReindexDialog';
import UploadResultDialog from '@/components/console/UploadResultDialog';
import {
  canReindex,
  formatGroupDescription,
  isJobRunning,
  resolveUploadErrorSurface,
} from '@/lib/console';
import {
  findDocumentGroupDetail,
  reindexDocumentGroupMock,
  uploadDocumentMock,
} from '@/mocks/console';
import type {
  DocumentUploadRequest,
  DocumentUploadTarget,
  ReindexStep,
  UploadOutcome,
} from '@/types/console.types';

export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const [uploadTarget, setUploadTarget] = useState<DocumentUploadTarget | null>(null);
  // 다시 업로드는 실패한 원래 모달로 돌아가야 하므로 직전 대상을 남겨 둔다.
  const [failedTarget, setFailedTarget] = useState<DocumentUploadTarget | null>(null);
  const [uploadOutcome, setUploadOutcome] = useState<UploadOutcome | null>(null);
  // 검색 반영은 확인, 잠금, 완료 또는 실패를 한 모달에서 단계로 보인다. null 이면 닫힌 상태다.
  const [reindexStep, setReindexStep] = useState<ReindexStep | null>(null);
  // 그룹이 사라진 뒤 도달한 업로드는 상세 조회 실패와 같으므로 화면 전체 오류로 바꾼다.
  const [isGroupMissing, setIsGroupMissing] = useState(false);
  const detail = findDocumentGroupDetail(groupId);

  if (detail === null || isGroupMissing) {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
        <ConsolePageHeader
          title="문서 그룹을 찾을 수 없습니다"
          description="주소가 바뀌었거나 삭제된 문서 그룹입니다"
        />
        <Link to="/console/document-groups" className="text-label text-label-alternative underline">
          문서 그룹 목록으로 돌아가기
        </Link>
      </ConsolePage>
    );
  }

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
        setIsGroupMissing(true);
        break;
      case 'refetch':
        // 화면이 낡아서 도달한 경우다. 모달을 두지 않고, 상세 조회를 붙일 때 이 자리에서 다시 조회한다.
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
      // 성공하면 새 검색 버전이 ACTIVE 가 되고 반영 대기가 없어진다.
      // 확인을 누르기 전에 배경 상세가 갱신되어 있어야 하므로, 상세 조회를 붙일 때 이 자리에서 다시 조회한다.
      setReindexStep({ status: 'done', result });
    } catch (error) {
      // 실패 모달은 한 종류이고 본문은 응답의 message 그대로다. 기존 ACTIVE 색인과 검색 코퍼스는 그대로 남는다.
      setReindexStep({ status: 'failed', message: toConsoleApiError(error).message });
    }
  };

  const handleUpload = async (request: DocumentUploadRequest) => {
    // 성공이든 실패든 결과 모달로 넘어가므로, 되돌아갈 대상을 미리 붙들어 둔다.
    const target = uploadTarget;

    try {
      const result = await uploadDocumentMock(request);
      // 성공하면 새 판이 잡히고 반영 대기가 하나 늘며 검색 반영 상태가 반영 필요로 바뀐다.
      // 배경 상세는 갱신된 상태로 보여야 하므로, 상세 조회를 붙일 때 이 자리에서 다시 조회한다.
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
    <ConsolePage
      breadcrumb={[{ label: '문서 관리', to: '/console/document-groups' }, { label: group.name }]}
    >
      <ConsolePageHeader
        title={group.name}
        description={formatGroupDescription(group.consumerKey)}
        actions={
          <div className="flex items-start gap-2">
            {/* GitBook 수집은 검색 반영 상태와 무관하게 실행 중인 작업이 있을 때에만 비활성이 된다. */}
            <Button variant="console-secondary" size="md" disabled={isRunning}>
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
          // 완료의 확인과 실패의 닫기 모두 모달만 닫는다.
          // 닫힐 때 상세 재조회 1회를 안전망으로 두기로 했으므로, 상세 조회를 붙일 때 이 자리에서 다시 조회한다.
          setReindexStep(null);
        }}
        onStart={() => void handleReindex()}
      />
    </ConsolePage>
  );
}
