import { Badge } from '@/components/common/badge';
import type { Citation } from '@/types/chat.types';
import { FaLink } from 'react-icons/fa6';

export type { Citation } from '@/types/chat.types';

const getDocumentUrl = (sourceUrl: string) => {
  const url = new URL(sourceUrl);
  url.pathname = url.pathname.replace(/\.md$/, '');

  return url.href;
};

export default function SourceBadge({ citation }: { citation: Citation }) {
  const documentUrl = citation.sourceUrl ? getDocumentUrl(citation.sourceUrl) : null;
  const citationLabel = [
    `${citation.citationNumber}. ${citation.documentTitle}`,
    ...citation.sectionPath,
  ].join(' > ');

  return (
    <Badge
      variant="link"
      render={documentUrl ? <a href={documentUrl} target="_blank" rel="noreferrer" /> : undefined}
      disabled={!documentUrl}
    >
      {documentUrl && <FaLink />}
      <span className="min-w-0 truncate">{citationLabel}</span>
    </Badge>
  );
}
