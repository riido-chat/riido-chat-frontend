import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentGroupTable from '@/components/console/DocumentGroupTable';
import { documentGroups } from '@/mocks/console';

export default function DocumentGroupListPage() {
  return (
    <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
      <ConsolePageHeader
        title="문서 그룹"
        description="챗봇 검색에 사용하는 문서를 그룹 단위로 관리합니다"
      />
      <DocumentGroupTable groups={documentGroups} />
    </ConsolePage>
  );
}
