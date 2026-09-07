import { Button } from '@/components/common/button';
import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { AppliedStatusBadge } from '@/components/console/StatusBadge';
import { canUploadRevision, formatDocumentVersion } from '@/lib/console';
import type { ConsoleDocument } from '@/types/console.types';

type DocumentTableProps = {
  documents: ConsoleDocument[];
  onUploadRevision?: (documentId: number) => void;
  /** 그룹에 실행 중인 작업이 있으면 행의 수정본 업로드 버튼을 모두 비활성으로 둔다. */
  isJobRunning?: boolean;
};

/** 문서 그룹 상세의 문서 목록 표 */
export default function DocumentTable({
  documents,
  onUploadRevision,
  isJobRunning = false,
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
          <ConsoleTableHead>반영 여부</ConsoleTableHead>
          <ConsoleTableHead>
            <span className="sr-only">행 동작</span>
          </ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {documents.map((doc) => (
          <tr key={doc.documentId}>
            {/* 문서 키와 원천은 열로 두지 않고 문서명 툴팁으로만 참조할 수 있게 한다. */}
            <ConsoleTableCell
              className="truncate"
              title={`${doc.title}\n문서 키: ${doc.documentKey}\n원천: ${doc.sourceType}`}
            >
              {doc.title}
            </ConsoleTableCell>
            <ConsoleTableCell>{formatDocumentVersion(doc.documentVersionNo)}</ConsoleTableCell>
            <ConsoleTableCell>{formatDocumentVersion(doc.appliedVersionNo)}</ConsoleTableCell>
            <ConsoleTableCell>
              <AppliedStatusBadge status={doc.appliedStatus} />
            </ConsoleTableCell>
            <ConsoleTableCell className="text-right">
              {/* 비활성 사유는 화면에 나타내지 않기로 했으므로 툴팁을 붙이지 않는다. */}
              <Button
                variant="console-secondary"
                size="md"
                disabled={!canUploadRevision(doc, isJobRunning)}
                onClick={() => onUploadRevision?.(doc.documentId)}
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
