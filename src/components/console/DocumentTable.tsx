import { Button } from '@/components/common/button';
import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { DocumentProcessStatusBadge } from '@/components/console/StatusBadge';
import { formatDocumentVersion } from '@/lib/console';
import type { ConsoleDocument } from '@/types/console.types';

type DocumentTableProps = {
  documents: ConsoleDocument[];
  onUploadRevision?: (documentId: string) => void;
  /** 검색 반영 작업이 진행 중이면 행의 업로드 버튼을 모두 비활성으로 둔다. */
  isRowActionDisabled?: boolean;
};

/** 문서 그룹 상세의 문서 목록 표 */
export default function DocumentTable({
  documents,
  onUploadRevision,
  isRowActionDisabled = false,
}: DocumentTableProps) {
  return (
    <ConsoleTable containerClassName="shadow-rc-shadow-center rounded-xl">
      <colgroup>
        <col />
        <col className="w-35" />
        <col className="w-40" />
        <col className="w-50" />
        <col className="w-65" />
      </colgroup>
      <thead>
        <tr>
          <ConsoleTableHead>문서명</ConsoleTableHead>
          <ConsoleTableHead>문서 버전</ConsoleTableHead>
          <ConsoleTableHead>검색 반영 버전</ConsoleTableHead>
          <ConsoleTableHead>처리 상태</ConsoleTableHead>
          <ConsoleTableHead>
            <span className="sr-only">행 동작</span>
          </ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            {/* 문서 ID는 열로 두지 않고 문서명 툴팁으로만 참조할 수 있게 한다. */}
            <ConsoleTableCell className="truncate" title={`${doc.name}\n문서 ID: ${doc.id}`}>
              {doc.name}
            </ConsoleTableCell>
            <ConsoleTableCell>{formatDocumentVersion(doc.documentVersion)}</ConsoleTableCell>
            <ConsoleTableCell>{formatDocumentVersion(doc.indexedVersion)}</ConsoleTableCell>
            <ConsoleTableCell>
              <DocumentProcessStatusBadge status={doc.processStatus} />
            </ConsoleTableCell>
            <ConsoleTableCell className="text-right">
              <Button
                variant="console-secondary"
                size="md"
                disabled={isRowActionDisabled}
                onClick={() => onUploadRevision?.(doc.id)}
              >
                수정본 업로드
              </Button>
            </ConsoleTableCell>
          </tr>
        ))}
      </ConsoleTableBody>
    </ConsoleTable>
  );
}
