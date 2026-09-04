import { SearchIndexStatusBadge } from '@/components/console/StatusBadge';
import { countPendingDocuments, formatPendingCount, formatSearchIndexVersion } from '@/lib/console';
import type { DocumentGroupDetail } from '@/types/console.types';

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 flex-col gap-1 whitespace-nowrap">
      <p className="text-caption text-label-alternative">{label}</p>
      <p className="text-body-1 text-label-normal font-semibold">{value}</p>
    </div>
  );
}

/**
 * 문서 그룹 상세의 요약 카드.
 * 검색 버전과 반영 대기 건수를 왼쪽에 두고, 검색 반영 상태 뱃지를 오른쪽 끝에 붙인다.
 */
export default function GroupSummaryCard({ group }: { group: DocumentGroupDetail }) {
  const pendingCount = countPendingDocuments(group.documents);

  return (
    <section
      aria-label="문서 그룹 요약"
      className="border-line-normal bg-background-default shadow-rc-shadow-center flex w-full items-start gap-8 rounded-xl border p-5"
    >
      <SummaryItem label="검색 버전" value={formatSearchIndexVersion(group.searchIndexVersion)} />
      <SummaryItem label="반영 대기" value={formatPendingCount(pendingCount)} />
      <div className="min-w-0 flex-1" />
      <div className="flex shrink-0 flex-col items-start gap-1">
        <p className="text-caption text-label-alternative whitespace-nowrap">검색 반영 상태</p>
        <SearchIndexStatusBadge status={group.searchIndexStatus} />
      </div>
    </section>
  );
}
