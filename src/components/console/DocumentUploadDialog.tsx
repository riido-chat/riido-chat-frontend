import { useId, useState } from 'react';

import { Button } from '@/components/common/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import FileDropzone from '@/components/console/FileDropzone';
import {
  DOCUMENT_TITLE_MAX_LENGTH,
  MARKDOWN_EXTENSION,
  formatFileSize,
  isMarkdownFileName,
  stripFileExtension,
} from '@/lib/console';
import type {
  DocumentUploadMode,
  DocumentUploadRequest,
  DocumentUploadTarget,
} from '@/types/console.types';

const DROPZONE_TITLE = 'Markdown 파일을 끌어다 놓거나 클릭해 선택';
const DROPZONE_HINT = 'Markdown 형식이 아닌 파일은 변환 후 업로드해주세요';
const INVALID_FORMAT_MESSAGE = 'Markdown(.md) 파일만 업로드할 수 있습니다';

const DIALOG_TITLE: Record<DocumentUploadMode, string> = {
  new: '신규 문서 업로드',
  revision: '수정본 업로드',
};

type DocumentUploadDialogProps = {
  /**
   * 열어 둘 업로드 대상. null 이면 모달이 닫힌다.
   * 대상을 바꿀 때에는 null 을 거쳐 모달을 먼저 닫아야 입력과 문구가 새 대상으로 갱신된다.
   */
  target: DocumentUploadTarget | null;
  /** 취소와 닫기. 모달만 닫고 상세 화면은 그대로 둔다. */
  onClose: () => void;
  /**
   * 파일 전송과 서버 처리를 모두 마칠 때까지 이어지는 업로드 실행.
   * 성공과 실패 모두 다음 모달로 넘어가는 일은 호출한 쪽이 맡으므로, 여기서는 결과를 판정하지 않는다.
   */
  onUpload: (request: DocumentUploadRequest) => Promise<void>;
};

/** 문서명 필드의 라벨. 값을 바꿀 수 없는 까닭을 라벨에 함께 적는다. */
function getDocumentNameLabel(mode: DocumentUploadMode, isUploading: boolean) {
  if (isUploading) {
    return '문서명 (전송 중 변경 불가)';
  }

  return mode === 'revision' ? '문서명 (변경 불가)' : '문서명 (필수)';
}

/**
 * 모달의 입력을 두 엔드포인트가 받는 요청으로 바꾼다.
 * 수정본 업로드는 문서명을 바꿀 수 없으므로 title 을 담지 않고 파일만 보낸다.
 */
function buildUploadRequest(
  target: DocumentUploadTarget,
  file: File,
  documentName: string,
): DocumentUploadRequest {
  if (target.mode === 'revision') {
    return { mode: 'revision', documentId: target.documentId, file };
  }

  return { mode: 'new', groupId: target.groupId, file, title: documentName.trim() };
}

/**
 * 신규 문서 업로드와 수정본 업로드를 함께 담당하는 모달.
 * 업로드를 누른 뒤에는 파일 전송이 끝나도 임베딩까지 마친 응답이 도착할 때까지 전송 중 상태를 유지하고,
 * 동기 실행이라 중간에 되돌릴 수 없으므로 취소까지 함께 비활성으로 둔다.
 */
export default function DocumentUploadDialog({
  target,
  onClose,
  onUpload,
}: DocumentUploadDialogProps) {
  const documentNameFieldId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // 닫히는 동안에도 제목과 문서명이 그대로 보이도록, 열릴 때 잡은 대상을 붙들어 둔다.
  const [activeTarget, setActiveTarget] = useState(target);
  const [wasOpen, setWasOpen] = useState(target !== null);

  const isOpen = target !== null;

  // 모달을 다시 열 때마다 대상을 새로 잡고 직전에 남은 입력을 지운다.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setActiveTarget(target);
      setFile(null);
      setDocumentName('');
      setFileError(null);
      setIsUploading(false);
    }
  }

  // 한 번도 열리지 않았으면 닫는 동작도 필요하지 않으므로 아무것도 그리지 않는다.
  if (activeTarget === null) {
    return null;
  }

  // 수정본 업로드는 교체 대상이 documentId 로 고정이라 문서명을 바꿀 수 없다.
  const isNameFixed = activeTarget.mode === 'revision';
  const nameFieldValue = isNameFixed ? activeTarget.documentTitle : documentName;
  // 업로드 버튼은 신규에서 파일과 문서명이 모두 있을 때, 수정본에서 파일이 있을 때 활성이 된다.
  const canUpload = file !== null && !isUploading && (isNameFixed || documentName.trim() !== '');

  const handleSelectFile = (selectedFile: File) => {
    if (!isMarkdownFileName(selectedFile.name)) {
      setFile(null);
      setFileError(INVALID_FORMAT_MESSAGE);
      return;
    }

    setFile(selectedFile);
    setFileError(null);

    // 신규 업로드의 문서명만 파일명에서 확장자를 제외한 값으로 채우고, 이후 사용자가 고칠 수 있다.
    if (!isNameFixed) {
      setDocumentName(stripFileExtension(selectedFile.name));
    }
  };

  const handleUpload = async () => {
    if (!canUpload || file === null) {
      return;
    }

    setIsUploading(true);

    try {
      await onUpload(buildUploadRequest(activeTarget, file, documentName));
    } finally {
      // 성공과 실패 모두 다음 모달로 넘어가지만, 넘어가지 못했다면 입력을 다시 만질 수 있게 되돌린다.
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // 전송 중에는 바깥 클릭과 Esc 로도 닫히지 않게 막아 중복 제출을 방지한다.
        if (!open && !isUploading) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-background-default shadow-rc-shadow-modal gap-4 rounded-xl border-0 p-6 text-left sm:max-w-130"
      >
        <DialogTitle className="text-body-1 leading-normal font-semibold">
          {DIALOG_TITLE[activeTarget.mode]}
        </DialogTitle>

        {/* 전송 중에는 파일을 바꿀 수 없으므로 선택 영역을 감추고 선택한 파일만 남긴다. */}
        {!isUploading && (
          <FileDropzone
            accept={MARKDOWN_EXTENSION}
            title={DROPZONE_TITLE}
            hint={DROPZONE_HINT}
            error={fileError}
            onSelectFile={handleSelectFile}
          />
        )}

        {file && (
          <div className="border-line-normal flex w-full items-center justify-between gap-3 rounded-lg border p-3">
            <p className="text-label text-label-normal truncate font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="text-caption text-label-alternative shrink-0">
              {formatFileSize(file.size)}
            </p>
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          <label
            htmlFor={documentNameFieldId}
            className="text-caption text-label-normal font-medium"
          >
            {getDocumentNameLabel(activeTarget.mode, isUploading)}
          </label>
          <Input
            id={documentNameFieldId}
            value={nameFieldValue}
            maxLength={DOCUMENT_TITLE_MAX_LENGTH}
            disabled={isNameFixed || isUploading}
            onChange={(event) => setDocumentName(event.target.value)}
          />
        </div>

        <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
          {/* 동기 실행이라 접수된 요청을 되돌릴 수 없으므로 전송 중에는 취소도 함께 비활성으로 둔다. */}
          <Button variant="console-secondary" size="md" disabled={isUploading} onClick={onClose}>
            취소
          </Button>
          <Button
            variant="console-primary"
            size="md"
            disabled={!canUpload}
            onClick={() => void handleUpload()}
          >
            {isUploading ? '업로드 중' : '업로드'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
