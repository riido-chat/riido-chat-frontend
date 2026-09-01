import ChatBubble from '@/components/chat/ChatBubble';
import ChatErrorNotice from '@/components/chat/ChatErrorNotice';
import ChatWithheldBubble from '@/components/chat/ChatWithheldBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import { Separator } from '@/components/common/separator';
import type { ChatTurnData, ChatTurnResponse, FeedbackRating } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';

type ChatTurnProps = {
  turn: ChatTurnData;
  onRatingChange: (rating: FeedbackRating | null) => void;
  onRetry: (turnId: string, question: string) => void;
};

export default function ChatTurn({ turn, onRatingChange, onRetry }: ChatTurnProps) {
  return (
    <MessageGroup>
      <ChatBubble role="user">{turn.question}</ChatBubble>
      <AssistantBubble
        response={turn.response}
        rating={turn.rating}
        onRatingChange={onRatingChange}
        onRetry={() => onRetry(turn.id, turn.question)}
      />
    </MessageGroup>
  );
}

function AssistantBubble({
  response,
  rating,
  onRatingChange,
  onRetry,
}: {
  response: ChatTurnResponse | null;
  rating: FeedbackRating | null;
  onRatingChange: (rating: FeedbackRating | null) => void;
  onRetry: () => void;
}) {
  if (response === null) {
    return (
      <ChatBubble role="assistant">
        <p className="text-rc-iris-500 animate-pulse">...</p>
      </ChatBubble>
    );
  }

  switch (response.status) {
    case 'ERROR':
      return <ChatErrorNotice isRetryable={response.error.retryable} onRetry={onRetry} />;

    case 'ABORTED':
      return (
        <ChatBubble role="assistant">
          <p className="text-label-assistive">답변이 중단되었습니다.</p>
        </ChatBubble>
      );

    case 'WITHHELD':
      return (
        <ChatBubble
          role="assistant"
          ragRunId={response.ragRunId}
          rating={rating}
          onRatingChange={onRatingChange}
        >
          <ChatWithheldBubble reasonCode={response.withheld.reasonCode} />
        </ChatBubble>
      );

    case 'COMPLETED':
      return (
        <ChatBubble
          role="assistant"
          ragRunId={response.ragRunId}
          rating={rating}
          onRatingChange={onRatingChange}
        >
          <ReactMarkdown>{response.answer.answerMarkdown}</ReactMarkdown>
          <Separator className="mt-2 mb-3 h-[1.2px]" />
          <SourceBadgeList citations={response.citations} />
        </ChatBubble>
      );
  }
}
