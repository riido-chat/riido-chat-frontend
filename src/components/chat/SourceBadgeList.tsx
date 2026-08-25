import SourceBadge, { type Citation } from '@/components/chat/SourceBadge';

type SourceBadgeListProps = {
  citations: Citation[];
};

export default function SourceBadgeList({ citations }: SourceBadgeListProps) {
  return (
    <div className="flex flex-col gap-1">
      {citations.map((citation) => (
        <SourceBadge key={citation.citationNumber} citation={citation} />
      ))}
    </div>
  );
}
