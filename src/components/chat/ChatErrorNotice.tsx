import { Button } from '@/components/common/button';
import { Separator } from '@/components/common/separator';
import { IoAlertCircle } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import type { ErrorChatResponse } from '@/types/chat.types';

type ChatErrorNoticeProps = {
  isRetryable: ErrorChatResponse['error']['retryable'];
  onRetry?: () => void;
};

export default function ChatErrorNotice({ isRetryable, onRetry }: ChatErrorNoticeProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <section className="flex w-full items-center gap-2">
        <Separator className="h-[1.2px] w-auto flex-1" />
        <IoAlertCircle className="text-label-assistive size-10" />
        <Separator className="h-[1.2px] w-auto flex-1" />
      </section>

      <section className="text-label-assistive flex flex-col items-center gap-0.5 text-center">
        <p className="text-body-2 font-medium">답변 제공에 실패했어요</p>
        <p className="text-label font-normal whitespace-pre-line">
          {'시스템 오류로 인해 답변을 제공할 수 없어요.\n다시 질문해주세요.'}
        </p>
      </section>

      {isRetryable && onRetry && (
        <Button variant="ghost" size="withIcon" onClick={onRetry}>
          <IoMdRefresh data-icon="inline-start" className="size-icon-sm" /> 다시 시도하기
        </Button>
      )}
    </div>
  );
}
