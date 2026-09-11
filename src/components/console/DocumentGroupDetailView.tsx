import { Button } from '@/components/common/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/tooltip';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import { useGitbookSyncFlow } from '@/hooks/useGitbookSyncFlow';
import { useReindexFlow } from '@/hooks/useReindexFlow';
import { useUploadFlow } from '@/hooks/useUploadFlow';
import { canReindex, findGitbookSource, formatGroupDescription, isJobRunning } from '@/lib/console';
import type { DocumentGroupDetail } from '@/types/console.types';

export const DOCUMENT_GROUP_LIST_PATH = '/document-groups';

type DocumentGroupDetailViewProps = {
  detail: DocumentGroupDetail;
  /** 실행이 끝나 배경 상세가 바뀌었을 때의 재조회 */
  onRefetch: () => void;
};

/** 조회가 끝난 문서 그룹 상세 화면. 업로드, 검색 반영, GitBook 수집 흐름을 이 안에서 연다. */
export default function DocumentGroupDetailView({
  detail,
  onRefetch,
}: DocumentGroupDetailViewProps) {
  const { group, summary, documents } = detail;

  const reindexFlow = useReindexFlow({ groupId: group.groupId, onRefetch });
  const uploadFlow = useUploadFlow({ onRefetch, onRequestReindex: reindexFlow.openConfirm });
  const gitbookSyncFlow = useGitbookSyncFlow({
    groupId: group.groupId,
    rootUrl: findGitbookSource(detail)?.rootUrl ?? null,
    onRefetch,
    onRequestReindex: reindexFlow.openConfirm,
  });

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
      uploadFlow.openRevision(targetDocument);
    }
  };

  return (
    <ConsolePage
      breadcrumb={[{ label: '문서 관리', to: DOCUMENT_GROUP_LIST_PATH }, { label: group.name }]}
    >
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
              onClick={gitbookSyncFlow.open}
            >
              GitBook 수집
            </Button>
            <Button
              variant="console-secondary"
              size="md"
              disabled={isRunning}
              onClick={() => uploadFlow.openNew(group.groupId)}
            >
              신규 문서 업로드
            </Button>
            {isReindexAvailable ? (
              <Button variant="console-primary" size="md" onClick={reindexFlow.openConfirm}>
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
      {uploadFlow.dialogs}
      {reindexFlow.dialog}
      {gitbookSyncFlow.dialogs}
    </ConsolePage>
  );
}
