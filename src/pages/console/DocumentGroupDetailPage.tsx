import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { Button } from '@/components/common/button';
import ConsolePage from '@/components/console/ConsolePage';
import ConsolePageHeader from '@/components/console/ConsolePageHeader';
import DocumentTable from '@/components/console/DocumentTable';
import DocumentUploadDialog from '@/components/console/DocumentUploadDialog';
import GroupSummaryCard from '@/components/console/GroupSummaryCard';
import { canReindex, isSearchIndexInProgress } from '@/lib/console';
import { findDocumentGroup } from '@/mocks/console';
import type { DocumentUploadMode } from '@/types/console.types';

type UploadTarget = {
  mode: DocumentUploadMode;
  documentName?: string;
};

const UPLOAD_MOCK_DELAY_MS = 1500;

/**
 * 업로드 API 는 아직 연결되지 않았다.
 * 파일 전송이 끝난 뒤에도 서버 처리(검증, 정규화, 해시 비교, 파싱, 청킹, 임베딩)를 마칠 때까지
 * 전송 중 상태를 유지한다는 흐름만 지연으로 재현한다.
 */
const requestDocumentUpload = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, UPLOAD_MOCK_DELAY_MS);
  });

export default function DocumentGroupDetailPage() {
  const { groupId } = useParams();
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const group = findDocumentGroup(groupId);

  if (!group) {
    return (
      <ConsolePage breadcrumb={[{ label: '문서 관리' }]}>
        <ConsolePageHeader
          title="문서 그룹을 찾을 수 없습니다"
          description="주소가 바뀌었거나 삭제된 문서 그룹입니다"
        />
        <Link to="/console/document-groups" className="text-label text-label-alternative underline">
          문서 그룹 목록으로 돌아가기
        </Link>
      </ConsolePage>
    );
  }

  const isInProgress = isSearchIndexInProgress(group.searchIndexStatus);

  const handleUploadRevision = (documentId: string) => {
    const targetDocument = group.documents.find((document) => document.id === documentId);

    if (targetDocument) {
      setUploadTarget({ mode: 'revision', documentName: targetDocument.name });
    }
  };

  return (
    <ConsolePage
      breadcrumb={[{ label: '문서 관리', to: '/console/document-groups' }, { label: group.name }]}
    >
      <ConsolePageHeader
        title={group.name}
        description={group.description}
        actions={
          <div className="flex items-start gap-2">
            <Button
              variant="console-secondary"
              size="md"
              disabled={isInProgress}
              onClick={() => setUploadTarget({ mode: 'new' })}
            >
              신규 문서 업로드
            </Button>
            <Button variant="console-primary" size="md" disabled={!canReindex(group)}>
              검색에 반영하기
            </Button>
          </div>
        }
      />
      <GroupSummaryCard group={group} />
      <DocumentTable
        documents={group.documents}
        isRowActionDisabled={isInProgress}
        onUploadRevision={handleUploadRevision}
      />
      {/* 취소나 닫기로 모달만 닫히고 상세 화면은 그대로 유지한다. */}
      <DocumentUploadDialog
        mode={uploadTarget?.mode ?? 'new'}
        open={uploadTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUploadTarget(null);
          }
        }}
        targetDocumentName={uploadTarget?.documentName}
        onUpload={requestDocumentUpload}
      />
    </ConsolePage>
  );
}
