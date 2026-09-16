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
          <BubbleContent>{children}</BubbleContent>
        </Bubble>

        {isFeedbackVisible && (
          <MessageFooter className="flex-col gap-2">
            {isRelatedDocsVisible && (
              <Bubble align="start" variant="assistant">
                <BubbleContent className="flex flex-col gap-3">
                  <section className="flex flex-col gap-0.5">
                    <span className="text-label text-label-normal font-semibold">
                      찾으시는 내용과 관련된 문서를 추천해드려요.
                    </span>
                    <span className="text-label text-label-alternative font-normal">
                      아래 문서를 확인해보시거나, 더 구체적인 질문을 입력해 주세요.
                    </span>
                  </section>
                  <SourceBadgeList citations={relatedSections} />
                </BubbleContent>
              </Bubble>
            )}
            <ChatFeedback ragRunId={ragRunId} rating={rating} onRatingChange={onRatingChange} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
