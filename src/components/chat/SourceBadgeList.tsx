import SourceBadge, { type Citation } from '@/components/chat/SourceBadge';

type SourceBadgeListProps = {
  citations: Citation[];
};

export default function SourceBadgeList({ citations }: SourceBadgeListProps) {
  return (
    <div className="flex max-w-full min-w-0 flex-col gap-1.5">
      {citations.map((citation) => (
        <SourceBadge key={citation.citationNumber} citation={citation} />
      ))}
    </div>
  );
}
