import * as React from 'react';

import ChatFeedback from '@/components/chat/ChatFeedback';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { Bubble, BubbleContent } from '@/components/common/bubble';
import { Message, MessageContent, MessageFooter } from '@/components/common/message';
import type { FeedbackRating, RelatedSection } from '@/types/chat.types';

type ChatBubbleProps = React.ComponentProps<'div'> & {
  role: 'user' | 'assistant';
  ragRunId?: string;
  rating?: FeedbackRating | null;
  relatedSections?: RelatedSection[];
  onRatingChange?: (rating: FeedbackRating | null) => void;
};

export default function ChatBubble({
  role,
  ragRunId,
  rating = null,
  onRatingChange,
  relatedSections = [],
  className,
  children,
  ...props
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const isFeedbackVisible = !isUser && ragRunId !== undefined && onRatingChange !== undefined;
  const isRelatedDocsVisible = relatedSections.length > 0;

  return (
    <Message align={isUser ? 'end' : 'start'} {...props}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'user' : 'assistant'}>
          <BubbleContent className={className}>{children}</BubbleContent>
        </Bubble>

        {isFeedbackVisible && (
          <MessageFooter className="flex-col gap-2">
            {isRelatedDocsVisible && (
              <div className="flex flex-col gap-3">
                <section className="flex flex-col">
                  <span className="text-label text-label-assistive font-semibold">
                    원하는 내용을 찾지 못하셨나요?
                  </span>
                  <span className="text-caption text-label-assistive font-normal">
                    아래 문서를 확인해보시거나, 더 구체적인 질문을 입력해 주세요.
                  </span>
                </section>
                <SourceBadgeList citations={relatedSections} />
              </div>
            )}
            <ChatFeedback ragRunId={ragRunId} rating={rating} onRatingChange={onRatingChange} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
