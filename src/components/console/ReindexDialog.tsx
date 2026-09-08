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
import { formatIndexVersionTransition } from '@/lib/console';
import type { ReindexStep } from '@/types/console.types';

const CONFIRM_TITLE = '검색에 반영하기';
const CONFIRM_MESSAGE = '최신 문서를 챗봇 검색에 반영하시겠습니까?';
const RUNNING_TITLE = '챗봇 검색 갱신 중';
const RUNNING_MESSAGE = '검색에 반영하고 있습니다.';
const DONE_TITLE = '최신 문서가 챗봇 검색에 반영되었습니다';
const FAILED_TITLE = '검색에 반영하지 못했습니다';

/**
 * 네 단계가 같은 420px 축약 모달을 쓴다. 업로드 결과 모달보다 좁고 여백이 넓으며 테두리가 없다.
 * 딤 위에 얹히는 모달이므로 상세 화면 안 카드로 두지 않는다.
 */
const REINDEX_DIALOG_CLASS =
  'bg-background-default shadow-rc-shadow-center gap-4 rounded-xl border-0 p-6 text-left sm:max-w-105';

type ReindexDialogProps = {
  /** 지금 보일 단계. null 이면 모달이 닫힌다. */
  step: ReindexStep | null;
  /** 확인의 취소, 완료의 확인, 실패의 닫기. 모달만 닫고 상세 화면은 그대로 둔다. */
  onClose: () => void;
  /** 확인의 반영 시작과 실패의 다시 시도. 별도 재시도 엔드포인트가 없어 둘 다 같은 호출이다. */
  onStart: () => void;
};

/** 단계마다 제목과 본문 한 줄이 정해져 있고, 실패의 본문만 서버가 내려준 message 그대로다. */
function getStepContent(step: ReindexStep) {
  switch (step.status) {
    case 'confirm':
      return { title: CONFIRM_TITLE, message: CONFIRM_MESSAGE };
    case 'running':
      return { title: RUNNING_TITLE, message: RUNNING_MESSAGE };
    case 'done':
      return { title: DONE_TITLE, message: formatIndexVersionTransition(step.result) };
    case 'failed':
      return { title: FAILED_TITLE, message: step.message };
  }
}

/**
 * 검색 반영의 확인, 잠금, 완료, 실패를 한 모달에서 단계로 바꿔 보인다.
 * 한 모달이 계속 열려 있어야 확인에서 잠금으로, 잠금에서 완료나 실패로 넘어갈 때 딤이 깜빡이지 않는다.
 * 실행이 동기라 잠금 단계에는 진행 단계와 진행률이 없고, 응답이 오면 바로 완료나 실패로 넘어간다.
 */
export default function ReindexDialog({ step, onClose, onStart }: ReindexDialogProps) {
  // 닫히는 동안에도 제목과 본문이 남아 있도록, 마지막으로 받은 단계를 붙들어 둔다.
  const [shownStep, setShownStep] = useState(step);

  if (step !== null && step !== shownStep) {
    setShownStep(step);
  }

  // 한 번도 열리지 않았으면 닫는 동작도 필요하지 않으므로 아무것도 그리지 않는다.
  if (shownStep === null) {
    return null;
  }

  const isOpen = step !== null;
  const isRunning = shownStep.status === 'running';
  const { title, message } = getStepContent(shownStep);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // 잠금 단계에는 닫기가 없고 딤 클릭과 Esc 로도 닫히지 않는다. 완료나 실패까지 기다린다.
        if (!open && !isRunning) {
          onClose();
        }
      }}
    >
      <DialogContent showCloseButton={false} className={REINDEX_DIALOG_CLASS} aria-busy={isRunning}>
        <div className="flex w-full items-center gap-2">
          {shownStep.status === 'failed' && <WarningMark />}
          <DialogTitle className="text-body-1 leading-normal font-semibold">{title}</DialogTitle>
        </div>

        <DialogDescription className="text-label text-label-normal animate-pulse">
          {message}
        </DialogDescription>

        {/* 잠금 단계는 뱃지와 버튼이 없어 본문까지만 그린다. */}
        {shownStep.status === 'confirm' && (
          <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
            <Button variant="console-secondary" size="md" onClick={onClose}>
              취소
            </Button>
            <Button variant="console-primary" size="md" onClick={onStart}>
              반영 시작
            </Button>
          </DialogFooter>
        )}

        {shownStep.status === 'done' && (
          <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
            <Button variant="console-primary" size="md" onClick={onClose}>
              확인
            </Button>
          </DialogFooter>
        )}

        {shownStep.status === 'failed' && (
          <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
            <Button variant="console-secondary" size="md" onClick={onClose}>
              닫기
            </Button>
            <Button variant="console-primary" size="md" onClick={onStart}>
              다시 시도
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
