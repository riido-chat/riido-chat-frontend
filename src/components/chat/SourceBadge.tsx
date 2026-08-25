import { Badge } from '@/components/common/badge';
import { FaLink } from 'react-icons/fa6';

export type Citation = {
  citationNumber: number;
  documentTitle: string;
  sectionPath: string[];
  sourceUrl: string;
};

export default function SourceBadge({ citation }: { citation: Citation }) {
  return (
    <Badge variant="link" render={<a href={citation.sourceUrl} target="_blank" rel="noreferrer" />}>
      <FaLink className="size-4" />
      <span className="flex items-center gap-1 [&>span+span]:before:mr-1 [&>span+span]:before:content-['>']">
        {citation.sectionPath.map((section) => (
          <span key={section}>{section}</span>
        ))}
      </span>
    </Badge>
  );
}
