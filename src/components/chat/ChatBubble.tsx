import * as React from 'react';

import { Bubble, BubbleContent } from '@/components/common/bubble';
import { Message, MessageContent } from '@/components/common/message';

type ChatBubbleProps = React.ComponentProps<'div'> & {
  role: 'user' | 'assistant';
};

export default function ChatBubble({ role, children, ...props }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <Message align={isUser ? 'end' : 'start'} {...props}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'user' : 'assistant'}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
