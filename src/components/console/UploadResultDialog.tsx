import { useState } from 'react';

import { Button } from '@/components/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/common/dialog';
import WarningMark from '@/components/console/WarningMark';
import { formatChunkStats } from '@/lib/console';
import { cn } from '@/lib/utils';
import type { UploadOutcome } from '@/types/console.types';

const READY_TITLE = '문서 처리가 완료되었습니다';
const FAILED_TITLE = '문서를 저장하지 못했습니다';

/**
 * 결과 모달은 업로드 모달보다 넓고 여백이 좁으며, 그림자도 상세 화면의 카드와 같은 톤을 쓴다.
 * 딤 위에 얹히는 축약 모달이므로 상세 화면 안 카드로 두지 않는다.
 */
const RESULT_DIALOG_CLASS =
  'bg-background-default shadow-rc-shadow-center gap-3.5 rounded-xl border p-5 text-left sm:max-w-155';

type UploadResultDialogProps = {
  /** 업로드가 끝난 결과. null 이면 모달이 닫힌다. */
  outcome: UploadOutcome | null;
  /** 닫기. 모달만 닫고 상세 화면은 그대로 둔다. */
  onClose: () => void;
  /** 준비 완료의 검색에 반영하기 */
  onReindex: () => void;
  /** 실패의 다시 업로드. 실패한 원래 업로드 모달로 되돌린다. */
  onRetry: () => void;
};

/**
 * 신규 업로드와 수정본 업로드가 함께 쓰는 업로드 결과 모달.
 * 성공은 한 종류이고 실패도 한 종류이며, 제목과 본문 한 줄과 버튼 두 개라는 구성을 공유한다.
 * 실행이 모두 동기이므로 진행률이나 단계를 보이지 않고, 결과가 정해진 뒤에만 열린다.
 */
export default function UploadResultDialog({
  outcome,
  onClose,
  onReindex,
  onRetry,
}: UploadResultDialogProps) {
  // 닫히는 동안에도 제목과 본문이 남아 있도록, 열릴 때 받은 결과를 붙들어 둔다.
  const [shownOutcome, setShownOutcome] = useState(outcome);
  const [wasOpen, setWasOpen] = useState(outcome !== null);

  const isOpen = outcome !== null;

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setShownOutcome(outcome);
    }
  }

  // 한 번도 열리지 않았으면 닫는 동작도 필요하지 않으므로 아무것도 그리지 않는다.
  if (shownOutcome === null) {
    return null;
  }

  const isReady = shownOutcome.status === 'ready';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(RESULT_DIALOG_CLASS, isReady ? 'border-line-normal' : 'border-rc-gray-200')}
      >
        <div className="flex w-full items-center gap-2">
          {!isReady && <WarningMark />}
          <DialogTitle className="text-body-1 leading-normal font-semibold">
            {isReady ? READY_TITLE : FAILED_TITLE}
          </DialogTitle>
        </div>

        {shownOutcome.status === 'ready' ? (
          <DialogDescription className="text-caption text-label-alternative">
            {formatChunkStats(shownOutcome.result.chunkStats)}
          </DialogDescription>
        ) : (
          <DialogDescription className="text-label text-label-normal">
            {shownOutcome.message}
          </DialogDescription>
        )}

        <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
          <Button variant="console-secondary" size="md" onClick={onClose}>
            닫기
          </Button>
          {isReady ? (
            <Button variant="console-primary" size="md" onClick={onReindex}>
              검색에 반영하기
            </Button>
          ) : (
            <Button variant="console-primary" size="md" onClick={onRetry}>
              다시 업로드
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
