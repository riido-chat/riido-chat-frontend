import { Badge } from '@/components/common/badge';
import type { Citation } from '@/types/chat.types';
import { FaLink } from 'react-icons/fa6';

export type { Citation } from '@/types/chat.types';

export default function SourceBadge({ citation }: { citation: Citation }) {
  const citationLabel = [
    `${citation.citationNumber}. ${citation.documentTitle}`,
    ...citation.sectionPath,
  ].join(' > ');

  return (
    <Badge variant="link" render={<a href={citation.sourceUrl} target="_blank" rel="noreferrer" />}>
      <FaLink />
      <span className="min-w-0 truncate">{citationLabel}</span>
    </Badge>
  );
}
