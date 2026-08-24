import { Textarea } from '@/components/common/textarea';
import { Button } from '@/components/common/button';
import { IoSend } from 'react-icons/io5';
import type { SubmitEvent } from 'react';

type ChatInputProps = {
  onSubmit: (message: string) => void;
};

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const message = String(formData.get('message') ?? '').trim();

    if (!message) return;

    onSubmit(message);
    event.currentTarget.reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-rc-gradation border-line-normal focus-within:ring-ring flex min-h-14 w-full items-center gap-4 rounded-md border-[1.2px] py-1.5 pr-1.5 pl-4 focus-within:ring-[1.6px]"
    >
      <Textarea name="message" aria-label="메시지 입력" placeholder="어떤 것이 궁금하세요?" />
      <Button
        type="submit"
        className="self-end"
        size="icon-lg"
        variant="icon"
        aria-label="메시지 전송"
      >
        <IoSend className="size-icon-lg origin-center translate-x-0.5 -translate-y-0.5 rotate-330" />
      </Button>
    </form>
  );
}
