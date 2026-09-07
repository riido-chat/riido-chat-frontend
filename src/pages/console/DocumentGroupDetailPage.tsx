import { Link, useParams } from 'react-router';

import { Button } from '@/components/common/button';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import { canReindex, formatGroupDescription, isJobRunning } from '@/lib/console';
import { findDocumentGroupDetail } from '@/mocks/console';

export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const detail = findDocumentGroupDetail(groupId);

  if (!detail) {
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

  return (
    <ConsolePage
      breadcrumb={[{ label: '문서 관리', to: '/console/document-groups' }, { label: group.name }]}
    >
      <ConsolePageHeader
        title={group.name}
        description={formatGroupDescription(group.consumerKey)}
        actions={
          <div className="flex items-start gap-2">
            <Button variant="console-secondary" size="md" disabled={isRunning}>
              신규 문서 업로드
            </Button>
            <Button variant="console-primary" size="md" disabled={!canReindex(detail)}>
              검색에 반영하기
            </Button>
          </div>
        }
      />
      <GroupSummaryCard summary={summary} />
      <DocumentTable documents={documents} isJobRunning={isRunning} />
    </ConsolePage>
  );
}
