import { Button } from '@/components/common/button';
import { deleteFeedback, putFeedback } from '@/api/chat';
import type { FeedbackRating } from '@/types/chat.types';
import { useRef } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

type ChatFeedbackProps = {
  ragRunId: string;
  rating: FeedbackRating | null;
  onRatingChange: (rating: FeedbackRating | null) => void;
};

export default function ChatFeedback({ ragRunId, rating, onRatingChange }: ChatFeedbackProps) {
  // 연타로 요청이 겹칠 때, 늦게 도착한 이전 응답이 최신 상태를 덮어쓰지 않게 한다.
  const requestSeqRef = useRef(0);

  const handleRate = async (nextRating: FeedbackRating) => {
    const prevRating = rating;
    // 같은 평가를 다시 누르면 해제(DELETE), 다른 평가를 누르면 등록·변경(PUT)
    const selectedRating = prevRating === nextRating ? null : nextRating;
    const seq = ++requestSeqRef.current;

    onRatingChange(selectedRating);

    try {
      const feedback =
        selectedRating === null
          ? await deleteFeedback(ragRunId)
          : await putFeedback(ragRunId, selectedRating);

      if (seq === requestSeqRef.current) onRatingChange(feedback.rating);
    } catch {
      if (seq === requestSeqRef.current) onRatingChange(prevRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="답변이 도움이 되었어요"
        aria-pressed={rating === 'GOOD'}
        onClick={() => handleRate('GOOD')}
      >
        <FiThumbsUp className={cn('size-icon-sm', rating === 'GOOD' && 'text-icon-iris-pressed')} />
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
    </div>
  );
}
