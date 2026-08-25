import { Badge } from '@/components/common/badge';
import { FaLink } from 'react-icons/fa6';

type Citation = {
  citationNumber: number;
  documentTitle: string;
  sectionPath: string[];
  sourceUrl: string;
};

export default function SourceBadge({ citation }: { citation: Citation[] }) {
  return (
    <div className="flex flex-col gap-1">
      {citation.map((item) => (
        <Badge
          key={item.citationNumber}
          variant="link"
          render={<a href={item.sourceUrl} target="_blank" rel="noreferrer" />}
        >
          <FaLink className="size-4" />
          <span className="flex items-center gap-1 [&>span+span]:before:mr-1 [&>span+span]:before:content-['>']">
            {item.sectionPath.map((section, index) => (
              <span key={index}>{section}</span>
            ))}
          </span>
        </Badge>
      ))}
    </div>
  );
}
