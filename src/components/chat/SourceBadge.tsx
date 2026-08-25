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
      <FaLink />
      <span className="min-w-0 truncate">{citation.sectionPath.join(' > ')}</span>
    </Badge>
  );
}
