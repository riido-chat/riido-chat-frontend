import { Link, useParams } from 'react-router';

import { Button } from '@/components/common/button';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import { canReindex, isSearchIndexInProgress } from '@/lib/console';
import { findDocumentGroup } from '@/mocks/console';

export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const group = findDocumentGroup(groupId);

  if (!group) {
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

  const isInProgress = isSearchIndexInProgress(group.searchIndexStatus);

  return (
    <ConsolePage
      breadcrumb={[{ label: '문서 관리', to: '/console/document-groups' }, { label: group.name }]}
    >
      <ConsolePageHeader
        title={group.name}
        description={group.description}
        actions={
          <div className="flex items-start gap-2">
            <Button variant="console-secondary" size="md" disabled={isInProgress}>
              신규 문서 업로드
            </Button>
            <Button variant="console-primary" size="md" disabled={!canReindex(group)}>
              검색에 반영하기
            </Button>
          </div>
        }
      />
      <GroupSummaryCard group={group} />
      <DocumentTable documents={group.documents} isRowActionDisabled={isInProgress} />
    </ConsolePage>
  );
}
