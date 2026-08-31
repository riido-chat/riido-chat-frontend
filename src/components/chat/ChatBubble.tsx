import * as React from 'react';

import ChatFeedback from '@/components/chat/ChatFeedback';
import { Bubble, BubbleContent } from '@/components/common/bubble';
import { Message, MessageContent, MessageFooter } from '@/components/common/message';

type ChatBubbleProps = React.ComponentProps<'div'> & {
  role: 'user' | 'assistant';
  // 답변 평가에 쓰이는 서버 측 식별자. 전달한 어시스턴트 버블에만 피드백 UI가 붙는다.
  ragRunId?: string;
};

export default function ChatBubble({ role, ragRunId, children, ...props }: ChatBubbleProps) {
  const isUser = role === 'user';
  const isFeedbackVisible = !isUser && ragRunId !== undefined;

  return (
    <Message align={isUser ? 'end' : 'start'} {...props}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'user' : 'assistant'}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
        {isFeedbackVisible && (
          <MessageFooter className="px-0">
            <ChatFeedback ragRunId={ragRunId} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
