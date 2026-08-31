import * as React from 'react';

import ChatFeedback from '@/components/chat/ChatFeedback';
import { Bubble, BubbleContent } from '@/components/common/bubble';
import { Message, MessageContent, MessageFooter } from '@/components/common/message';
import type { FeedbackRating } from '@/types/chat.types';

type ChatBubbleProps = React.ComponentProps<'div'> & {
  role: 'user' | 'assistant';
  ragRunId?: string;
  rating?: FeedbackRating | null;
  onRatingChange?: (rating: FeedbackRating | null) => void;
};

export default function ChatBubble({
  role,
  ragRunId,
  rating = null,
  onRatingChange,
  children,
  ...props
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const isFeedbackVisible = !isUser && ragRunId !== undefined && onRatingChange !== undefined;

  return (
    <Message align={isUser ? 'end' : 'start'} {...props}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'user' : 'assistant'}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
        {isFeedbackVisible && (
          <MessageFooter className="px-0">
            <ChatFeedback ragRunId={ragRunId} rating={rating} onRatingChange={onRatingChange} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
