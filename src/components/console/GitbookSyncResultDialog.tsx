import { useState } from 'react';

import { Button } from '@/components/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/common/dialog';
import SummaryItem from '@/components/console/SummaryItem';
import WarningMark from '@/components/console/WarningMark';
import { formatGitbookSyncTarget, hasGitbookSyncChanges } from '@/lib/console';
import type { GitbookSyncCounts, GitbookSyncOutcome } from '@/types/console.types';

const DONE_TITLE = 'GitBook 수집이 완료되었습니다';
const FAILED_TITLE = 'GitBook 수집에 실패했습니다';

// 숫자 다섯 개의 라벨과 순서. removed 는 total 밖의 값이지만 같은 줄에 나란히 보인다.
const COUNT_ITEMS: { key: keyof Omit<GitbookSyncCounts, 'total'>; label: string }[] = [
  { key: 'created', label: '신규' },
  { key: 'updated', label: '변경' },
  { key: 'noChange', label: '변경 없음' },
  { key: 'removed', label: '제거' },
  { key: 'failed', label: '실패' },
];

/**
 * 결과 모달은 업로드 결과 모달과 같은 620px 규격이다. 수집 모달보다 넓고 여백이 좁으며 테두리가 있다.
 * 딤 위에 얹히는 축약 모달이므로 상세 화면 안 카드로 두지 않는다.
 */
const DONE_DIALOG_CLASS =
  'bg-background-default shadow-rc-shadow-center border-line-normal gap-3.5 rounded-xl border p-5 text-left sm:max-w-155';

/** 오류 모달은 검색 반영 실패 모달과 같은 420px 규격이다. 제목 앞에 경고 표시가 붙고 본문은 응답의 message 그대로다. */
const FAILED_DIALOG_CLASS =
  'bg-background-default shadow-rc-shadow-center gap-4 rounded-xl border-0 p-6 text-left sm:max-w-105';

type GitbookSyncResultDialogProps = {
  /** 수집이 끝난 결과. null 이면 모달이 닫힌다. */
  outcome: GitbookSyncOutcome | null;
  /** 닫기. 모달만 닫고 상세 화면은 그대로 둔다. */
  onClose: () => void;
  /** 완료의 검색에 반영하기 */
  onReindex: () => void;
  /** 오류 모달의 다시 시도. 수집 모달을 처음 상태로 다시 연다. */
  onRetry: () => void;
};

/**
 * GitBook 수집의 완료와 오류를 함께 담당하는 결과 모달.
 * 완료는 페이지별 처리 결과 집계 다섯 개를 보이고, 페이지 단위 실패는 배치를 멈추지 않으므로 실패 건수로만 알린다.
 * 오류는 요청 자체가 거절되거나 본문을 읽지 못한 경우의 대비책이며, 제목과 본문 한 줄과 버튼 두 개로 구성이 같다.
 */
export default function GitbookSyncResultDialog({
  outcome,
  onClose,
  onReindex,
  onRetry,
}: GitbookSyncResultDialogProps) {
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

  const isDone = shownOutcome.status === 'done';

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
        className={isDone ? DONE_DIALOG_CLASS : FAILED_DIALOG_CLASS}
      >
        <div className="flex w-full items-center gap-2">
          {!isDone && <WarningMark />}
          <DialogTitle className="text-body-1 leading-normal font-semibold">
            {isDone ? DONE_TITLE : FAILED_TITLE}
          </DialogTitle>
        </div>

        {shownOutcome.status === 'done' ? (
          <>
            <DialogDescription className="text-caption text-label-alternative">
              {formatGitbookSyncTarget(shownOutcome.result)}
            </DialogDescription>
            {/* 다섯 값 모두 서버가 집계해서 내려주므로 화면에서 다시 세지 않는다. */}
            <div className="flex w-full items-start gap-7">
              {COUNT_ITEMS.map(({ key, label }) => (
                <SummaryItem
                  key={key}
                  label={label}
                  value={shownOutcome.result.counts[key].toLocaleString('ko-KR')}
                />
              ))}
            </div>
          </>
        ) : (
          <DialogDescription className="text-label text-label-normal">
            {shownOutcome.message}
          </DialogDescription>
        )}

        <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
          <Button variant="console-secondary" size="md" onClick={onClose}>
            닫기
          </Button>
          {shownOutcome.status === 'done' ? (
            // 전부 변경 없음이면 반영 대기가 늘지 않았으므로 검색에 반영하기를 비활성으로 두고 닫기만 남긴다.
            <Button
              variant="console-primary"
              size="md"
              disabled={!hasGitbookSyncChanges(shownOutcome.result.counts)}
              onClick={onReindex}
            >
              검색에 반영하기
            </Button>
          ) : (
            <Button variant="console-primary" size="md" onClick={onRetry}>
              다시 시도
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
