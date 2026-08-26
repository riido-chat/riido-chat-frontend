import ChatBubble from '@/components/chat/ChatBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import type { Citation } from '@/components/chat/SourceBadge';
import { MessageGroup } from '@/components/common/message';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/common/separator';

type ChatTurnProps = {
  question: string;
  answerMarkdown: string;
  citations?: Citation[];
};

export default function ChatTurn({ question, answerMarkdown, citations = [] }: ChatTurnProps) {
  return (
    <MessageGroup>
      <ChatBubble role="user">{question}</ChatBubble>

      <ChatBubble role="assistant">
        <ReactMarkdown>{answerMarkdown}</ReactMarkdown>

        {citations.length > 0 && (
          <>
            <Separator className="mt-2 mb-3 h-[1.2px]" />
            <SourceBadgeList citations={citations} />
          </>
        )}
      </ChatBubble>
    </MessageGroup>
  );
}
