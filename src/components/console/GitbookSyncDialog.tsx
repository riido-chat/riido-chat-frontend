import { useId, useState } from 'react';

import { Button } from '@/components/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { normalizeSourceUrl } from '@/lib/console';
import type { GitbookSyncTarget } from '@/types/console.types';

const IDLE_TITLE = 'GitBook 수집';
const RUNNING_TITLE = 'GitBook 수집 중';
const SAVED_SOURCE_MESSAGE = 'GitBook 을 다시 읽어 변경된 페이지만 새 판으로 만듭니다.';
const INPUT_MESSAGE = '수집할 GitBook 루트 URL 을 입력해 주세요.';
const RUNNING_MESSAGE = '문서를 가져오고 있습니다.';
const URL_FIELD_LABEL = 'GitBook 루트 URL';
const URL_FIELD_PLACEHOLDER = 'https://docs.riido.io';

/**
 * 수집 모달은 검색 반영 모달과 같은 420px 축약 모달이다. 여백이 넓고 테두리가 없다.
 * 딤 위에 얹히는 모달이므로 상세 화면 안 카드로 두지 않는다.
 */
const SYNC_DIALOG_CLASS =
  'bg-background-default shadow-rc-shadow-center gap-4 rounded-xl border-0 p-6 text-left sm:max-w-105';

type GitbookSyncDialogProps = {
  /**
   * 열어 둘 수집 대상. null 이면 모달이 닫힌다.
   * 대상을 바꿀 때에는 null 을 거쳐 모달을 먼저 닫아야 입력과 문구가 새 대상으로 갱신된다.
   */
  target: GitbookSyncTarget | null;
  /** 취소. 모달만 닫고 상세 화면은 그대로 둔다. */
  onClose: () => void;
  /**
   * 페이지 목록 조회와 페이지별 처리를 모두 마칠 때까지 이어지는 수집 실행.
   * 성공과 실패 모두 다음 모달로 넘어가는 일은 호출한 쪽이 맡으므로, 여기서는 결과를 판정하지 않는다.
   */
  onSync: (sourceUrl: string) => Promise<void>;
};

/**
 * 원천이 있는 그룹의 재수집과 원천이 없는 그룹의 첫 수집을 함께 담당하는 모달.
 * 원천이 있으면 저장된 루트 URL 을 읽기 전용으로 보이고, 없으면 루트 URL 을 입력받는다.
 * 수집 시작을 누른 뒤에는 응답이 도착할 때까지 같은 모달을 비활성으로 유지하고,
 * 동기 실행이라 중간에 되돌릴 수 없으므로 취소까지 함께 비활성으로 둔다.
 */
export default function GitbookSyncDialog({ target, onClose, onSync }: GitbookSyncDialogProps) {
  const urlFieldId = useId();
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  // 닫히는 동안에도 제목과 루트 URL 이 그대로 보이도록, 열릴 때 잡은 대상을 붙들어 둔다.
  const [activeTarget, setActiveTarget] = useState(target);
  const [wasOpen, setWasOpen] = useState(target !== null);

  const isOpen = target !== null;

  // 모달을 다시 열 때마다 대상을 새로 잡고 직전에 남은 입력을 지운다.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setActiveTarget(target);
      setSourceUrl('');
      setIsSyncing(false);
    }
  }

  // 한 번도 열리지 않았으면 닫는 동작도 필요하지 않으므로 아무것도 그리지 않는다.
  if (activeTarget === null) {
    return null;
  }

  // 1차 화면은 원천 하나만 다루므로 원천이 있으면 다른 URL 입력 자체를 막는다.
  const isSourceFixed = activeTarget.rootUrl !== null;
  const urlFieldValue = activeTarget.rootUrl ?? sourceUrl;
  // 수집 시작은 원천이 있으면 항상, 없으면 입력이 비어 있지 않을 때 활성이 된다. https 여부는 서버가 판정한다.
  const canStart = !isSyncing && (isSourceFixed || sourceUrl.trim() !== '');

  const handleSync = async () => {
    if (!canStart) {
      return;
    }

    setIsSyncing(true);

    try {
      await onSync(normalizeSourceUrl(urlFieldValue));
    } finally {
      // 성공과 실패 모두 다음 모달로 넘어가지만, 넘어가지 못했다면 입력을 다시 만질 수 있게 되돌린다.
      setIsSyncing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // 수집 중에는 바깥 클릭과 Esc 로도 닫히지 않게 막아 이탈과 중복 제출을 방지한다.
        if (!open && !isSyncing) {
          onClose();
        }
      }}
    >
      <DialogContent showCloseButton={false} className={SYNC_DIALOG_CLASS} aria-busy={isSyncing}>
        <DialogTitle className="text-body-1 leading-normal font-semibold">
          {isSyncing ? RUNNING_TITLE : IDLE_TITLE}
        </DialogTitle>

        <DialogDescription
          className={
            isSyncing
              ? 'text-label text-label-normal animate-pulse'
              : 'text-label text-label-normal'
          }
        >
          {isSyncing ? RUNNING_MESSAGE : isSourceFixed ? SAVED_SOURCE_MESSAGE : INPUT_MESSAGE}
        </DialogDescription>

        <div className="flex w-full flex-col gap-2">
          <label htmlFor={urlFieldId} className="text-caption text-label-normal font-medium">
            {URL_FIELD_LABEL}
          </label>
          <Input
            id={urlFieldId}
            type="url"
            value={urlFieldValue}
            placeholder={URL_FIELD_PLACEHOLDER}
            disabled={isSourceFixed || isSyncing}
            onChange={(event) => setSourceUrl(event.target.value)}
          />
        </div>

        <DialogFooter className="flex-row justify-end gap-2 [&>button]:w-auto sm:[&>button]:flex-none">
          {/* 동기 실행이라 접수된 요청을 되돌릴 수 없으므로 수집 중에는 취소도 함께 비활성으로 둔다. */}
          <Button variant="console-secondary" size="md" disabled={isSyncing} onClick={onClose}>
            취소
          </Button>
          <Button
            variant="console-primary"
            size="md"
            disabled={!canStart}
            onClick={() => void handleSync()}
            className={isSyncing ? 'animate-pulse' : ''}
          >
            {isSyncing ? '수집 중' : '수집 시작'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
