import { SearchStatusBadge } from '@/components/console/StatusBadge';
import SummaryItem from '@/components/console/SummaryItem';
import { formatActiveIndexVersion, formatPendingCount } from '@/lib/console';
import type { SearchIndexSummary } from '@/types/console.types';

/**
 * 문서 그룹 상세의 요약 카드.
 * 검색 버전과 반영 대기 건수를 왼쪽에 두고, 검색 반영 상태 뱃지를 오른쪽 끝에 붙인다.
 * 세 값 모두 서버가 계산해서 내려주므로 화면에서 다시 세지 않는다.
 */
export default function GroupSummaryCard({ summary }: { summary: SearchIndexSummary }) {
  return (
    <section
      aria-label="문서 그룹 요약"
      className="border-line-normal bg-background-default shadow-rc-shadow-center flex w-full items-start gap-8 rounded-xl border p-5"
    >
      <SummaryItem
        label="검색 버전"
        value={formatActiveIndexVersion(summary.activeIndexVersion?.versionNo ?? null)}
      />
      <SummaryItem label="반영 대기" value={formatPendingCount(summary.pendingCount)} />
      <div className="min-w-0 flex-1" />
      <div className="flex shrink-0 flex-col items-start gap-1">
        <p className="text-caption text-label-alternative whitespace-nowrap">검색 반영 상태</p>
        <SearchStatusBadge status={summary.searchStatus} />
      </div>
    </section>
  );
}
