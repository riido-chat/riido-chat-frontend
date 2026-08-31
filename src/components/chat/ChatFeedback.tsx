import { Button } from '@/components/common/button';
import { deleteFeedback, putFeedback } from '@/api/chat';
import type { FeedbackRating } from '@/types/chat.types';
import { useState } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

type ChatFeedbackProps = {
  ragRunId: string;
  rating: FeedbackRating | null;
  onRatingChange: (rating: FeedbackRating | null) => void;
};

export default function ChatFeedback({ ragRunId, rating, onRatingChange }: ChatFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (nextRating: FeedbackRating) => {
    // 요청이 겹치면 늦게 도착한 이전 응답이 최신 상태를 덮어쓰므로, 앞선 요청이 끝날 때까지 받지 않는다.
    if (isSubmitting) return;

    const prevRating = rating;
    // 같은 평가를 다시 누르면 해제(DELETE), 다른 평가를 누르면 등록·변경(PUT)
    const selectedRating = prevRating === nextRating ? null : nextRating;

    onRatingChange(selectedRating);
    setIsSubmitting(true);

    try {
      const feedback =
        selectedRating === null
          ? await deleteFeedback(ragRunId)
          : await putFeedback(ragRunId, selectedRating);

      onRatingChange(feedback.rating);
    } catch {
      onRatingChange(prevRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-caption text-label-alternative font-medium">답변이 도움 되셨나요?</p>
      <section className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="답변이 도움이 되었어요"
          aria-pressed={rating === 'GOOD'}
          onClick={() => handleRate('GOOD')}
        >
          <FiThumbsUp
            className={cn('size-icon-sm', rating === 'GOOD' && 'text-icon-iris-pressed')}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="답변이 도움이 되지 않았어요"
          aria-pressed={rating === 'BAD'}
          onClick={() => handleRate('BAD')}
        >
          <FiThumbsDown
            className={cn('size-icon-sm', rating === 'BAD' && 'text-icon-iris-pressed')}
          />
        </Button>
      </section>
    </div>
  );
}
