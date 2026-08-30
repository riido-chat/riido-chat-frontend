import { Textarea } from '@/components/common/textarea';
import { Button } from '@/components/common/button';
import { IoSend } from 'react-icons/io5';
import { useRef, type KeyboardEvent, type SubmitEvent } from 'react';

type ChatInputProps = {
  onSubmit: (message: string) => void;
  isSubmitting?: boolean;
};

export default function ChatInput({ onSubmit, isSubmitting = false }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const message = String(formData.get('message') ?? '').trim();

    if (!message) {
      inputRef.current?.focus();
      return;
    }

    onSubmit(message);
    event.currentTarget.reset();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="bg-rc-gradation ring-line-normal focus-within:ring-rc-iris-200 flex min-h-14 w-full items-center gap-4 rounded-md py-2 pr-2 pl-4 ring-[1.2px] focus-within:ring-[1.6px]"
      >
        <Textarea
          name="message"
          aria-label="메시지 입력"
          placeholder="어떤 것이 궁금하세요?"
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
        <Button
          type="submit"
          className="text-icon-iris-enabled bg-button-tertiary-enabled hover:bg-button-tertiary-pressed active:text-button-primary-pressed disabled:bg-button-gray-pressed disabled:text-button-disabled self-end"
          size="icon-md"
          variant="icon"
          aria-label="메시지 전송"
          disabled={isSubmitting}
        >
          <IoSend className="size-icon-md origin-center translate-x-0.5 -translate-y-0.5 rotate-330" />
        </Button>
      </form>
      <p className="text-caption text-label-assistive text-center font-normal">
        AI 답변으로 해결되지 않는 경우 1:1 상담을 이용해 주세요.
      </p>
    </div>
  );
}
