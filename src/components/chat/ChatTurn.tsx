import ChatBubble from '@/components/chat/ChatBubble';
import ChatErrorNotice from '@/components/chat/ChatErrorNotice';
import ChatWithheldBubble from '@/components/chat/ChatWithheldBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import { Separator } from '@/components/common/separator';
import type { ChatTurnData, ChatTurnResponse, FeedbackRating } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';
import loadingImage from '@/assets/icons/loading.apng';

type ChatTurnProps = {
  turn: ChatTurnData;
  onRatingChange: (rating: FeedbackRating | null) => void;
  onRetry?: () => void;
};

export default function ChatTurn({ turn, onRatingChange, onRetry }: ChatTurnProps) {
  return (
    <MessageGroup>
      <ChatBubble role="user">{turn.question}</ChatBubble>
      <AssistantBubble
        response={turn.response}
        rating={turn.rating}
        onRatingChange={onRatingChange}
        onRetry={onRetry}
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
  onRetry?: () => void;
}) {
  if (response === null) {
    return (
      <ChatBubble role="assistant">
        <div className="flex items-center gap-2">
          <img src={loadingImage} alt="loading..." className="size-icon-lg" />
          <p className="text-label-assistive text-body-2 animate-pulse font-bold">
            답변 생성 중...
          </p>
        </div>
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
          <ReactMarkdown
            components={{
              code({ className, children }) {
                return (
                  <code
                    className={`bg-rc-gray-200/70 rounded px-1 py-0.5 font-mono text-[0.85em] ${className ?? ''}`}
                  >
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return (
                  <pre className="bg-rc-gray-900 text-rc-gray-0 my-3 overflow-x-auto rounded-md p-3 text-sm [&>code]:bg-transparent [&>code]:p-0">
                    {children}
                  </pre>
                );
              },
            }}
          >
            {response.answer.answerMarkdown}
          </ReactMarkdown>
          <Separator className="mt-2 mb-3 h-[1.2px]" />
          <SourceBadgeList citations={response.citations} />
        </ChatBubble>
      );
  }
}
