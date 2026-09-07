import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type FileDropzoneProps = {
  /** 파일 선택 창에 걸어 둘 accept 값 */
  accept: string;
  title: string;
  /** 지원 형식 안내. 오류가 없을 때 상시 노출한다. */
  hint: string;
  /** 클라이언트 형식 검증에 실패했을 때의 문구. 값이 있으면 힌트 대신 오류로 표시한다. */
  error?: string | null;
  onSelectFile: (file: File) => void;
};

/**
 * 업로드 모달의 파일 선택 영역.
 * 끌어다 놓기와 클릭 선택을 모두 받고, 형식 검증은 파일을 넘겨받는 쪽에서 처리한다.
 */
export default function FileDropzone({
  accept,
  title,
  hint,
  error = null,
  onSelectFile,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectFirstFile = (files: FileList | null) => {
    const file = files?.item(0);

    if (file) {
      onSelectFile(file);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          selectFirstFile(event.dataTransfer.files);
        }}
        className={cn(
          'border-rc-gray-200 bg-rc-gray-50 focus-visible:ring-button-primary-enabled/50 flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-5 transition-colors outline-none focus-visible:ring-3',
          isDragOver && 'border-button-primary-enabled bg-button-tertiary-hovered',
          error && 'border-rc-rose-500 bg-rc-rose-50',
        )}
      >
        <span className="text-label text-label-normal font-medium">{title}</span>
        <span className={cn('text-caption text-label-assistive', error && 'text-rc-rose-600')}>
          {error ?? hint}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          selectFirstFile(event.target.files);
          // 같은 파일을 다시 골라도 change 가 일어나도록 값을 비운다.
          event.target.value = '';
        }}
      />
    </>
  );
}
