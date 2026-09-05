import { useId, useState } from 'react';

import { Button } from '@/components/common/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import FileDropzone from '@/components/console/FileDropzone';
import {
  MARKDOWN_EXTENSION,
  formatFileSize,
  isMarkdownFileName,
  stripFileExtension,
} from '@/lib/console';
import type { DocumentUploadMode } from '@/types/console.types';

const DROPZONE_TITLE = 'Markdown 파일을 끌어다 놓거나 클릭해 선택';
const DROPZONE_HINT = 'Markdown 형식이 아닌 파일은 변환 후 업로드해주세요';
const INVALID_FORMAT_MESSAGE = 'Markdown(.md) 파일만 업로드할 수 있습니다';

const DIALOG_TITLE: Record<DocumentUploadMode, string> = {
  new: '신규 문서 업로드',
  revision: '수정본 업로드',
};

/**
 * 문서명 필드는 높이 40을 고정하고, 비활성일 때는 흐리게 낮추는 대신
 * 읽기 전용 표시에 쓰는 회색 배경과 보조 라벨색으로 바꾼다.
 */
const DOCUMENT_NAME_FIELD_CLASS =
  'bg-background-default text-label md:text-label disabled:bg-background-tertiary disabled:border-rc-gray-200 disabled:text-label-assistive h-10 px-3 disabled:opacity-100';

export type DocumentUploadPayload = {
  file: File;
  documentName: string;
};

type DocumentUploadDialogProps = {
  /** 신규 업로드와 수정본 업로드는 제목과 문서명 필드의 활성 여부만 다르다. */
  mode: DocumentUploadMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 수정본 업로드에서 교체 대상 문서의 이름. 비활성 필드로 기존 값만 보여준다. */
  targetDocumentName?: string;
  /** 파일 전송과 서버 처리를 모두 마칠 때까지 이어지는 업로드 실행 */
  onUpload: (payload: DocumentUploadPayload) => Promise<void>;
};

/** 문서명 필드의 라벨. 값을 바꿀 수 없는 까닭을 라벨에 함께 적는다. */
function getDocumentNameLabel(mode: DocumentUploadMode, isUploading: boolean) {
  if (isUploading) {
    return '문서명 (전송 중 변경 불가)';
  }

  return mode === 'revision' ? '문서명 (변경 불가)' : '문서명 (필수)';
}

/**
 * 신규 문서 업로드와 수정본 업로드를 함께 담당하는 모달.
 * 업로드를 누른 뒤에는 파일 전송이 끝나도 서버 처리가 끝날 때까지 전송 중 상태를 유지한다.
 */
export default function DocumentUploadDialog({
  mode,
  open,
  onOpenChange,
  targetDocumentName,
  onUpload,
}: DocumentUploadDialogProps) {
  const documentNameFieldId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // 모달을 다시 열 때마다 직전에 남은 입력을 지운다.
  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setFile(null);
      setDocumentName('');
      setFileError(null);
      setIsUploading(false);
    }
  }

  // 수정본 업로드는 교체 대상이 document_id 로 고정이라 문서명을 바꿀 수 없다.
  const isNameFixed = mode === 'revision';
  const nameFieldValue = isNameFixed ? (targetDocumentName ?? '') : documentName;
  const canUpload = file !== null && !isUploading && (isNameFixed || documentName.trim() !== '');

  const handleSelectFile = (selectedFile: File) => {
    if (!isMarkdownFileName(selectedFile.name)) {
      setFile(null);
      setFileError(INVALID_FORMAT_MESSAGE);
      return;
    }

    setFile(selectedFile);
    setFileError(null);
    // 문서명은 파일명에서 확장자를 제외한 값으로 채우고, 이후 사용자가 고칠 수 있다.
    setDocumentName(stripFileExtension(selectedFile.name));
  };

  const handleUpload = async () => {
    if (!file || !canUpload) {
      return;
    }

    setIsUploading(true);

    try {
      await onUpload({ file, documentName: nameFieldValue.trim() });
      onOpenChange(false);
    } catch {
      // 업로드 실패 안내는 뒤이은 결과 화면이 맡으므로, 여기서는 모달만 열어 둔다.
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background-default shadow-rc-shadow-modal gap-4 rounded-xl border-0 p-6 text-left sm:max-w-130"
      >
        <DialogTitle className="text-body-1 leading-normal font-semibold">
          {DIALOG_TITLE[mode]}
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
            {getDocumentNameLabel(mode, isUploading)}
          </label>
          <Input
            id={documentNameFieldId}
            className={DOCUMENT_NAME_FIELD_CLASS}
            value={nameFieldValue}
            disabled={isNameFixed || isUploading}
            onChange={(event) => setDocumentName(event.target.value)}
          />
        </div>

        <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
          <Button variant="console-secondary" size="md" onClick={() => onOpenChange(false)}>
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
