import ChatBubble from '@/components/chat/ChatBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import type { ChatResponse } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/common/separator';

type ChatTurnProps = {
  question: string;
  response: ChatResponse | null;
};

export default function ChatTurn({ question, response }: ChatTurnProps) {
  return (
    <MessageGroup>
      <ChatBubble role="user">{question}</ChatBubble>

      <ChatBubble role="assistant">
        <AssistantAnswer response={response} />
      </ChatBubble>
    </MessageGroup>
  );
}

function AssistantAnswer({ response }: { response: ChatResponse | null }) {
  if (response === null) {
    return <p className="animate-pulse">답변을 생성하고 있어요...</p>;
  }

  if (response.status === 'WITHHELD') {
    return <p>{response.withheld.message}</p>;
  }

  if (response.status === 'ERROR') {
    return <p>{response.error.message}</p>;
  }

  return (
    <>
      <ReactMarkdown>{response.answer.answerMarkdown}</ReactMarkdown>

      {response.citations.length > 0 && (
        <>
          <Separator className="mt-2 mb-3 h-[1.2px]" />
          <SourceBadgeList citations={response.citations} />
        </>
      )}
    </>
  );
}
