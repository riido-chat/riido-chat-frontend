import ChatBubble from '@/components/chat/ChatBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import type { CompletedChatResponse } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/common/separator';

type ChatTurnProps = {
  question: string;
  response: CompletedChatResponse;
};

export default function ChatTurn({ question, response }: ChatTurnProps) {
  const { answer, citations } = response;

  return (
    <MessageGroup>
      <ChatBubble role="user">{question}</ChatBubble>

      <ChatBubble role="assistant">
        <ReactMarkdown>{answer.answerMarkdown}</ReactMarkdown>

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
