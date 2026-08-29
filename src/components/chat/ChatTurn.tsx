import ChatBubble from '@/components/chat/ChatBubble';
import ChatErrorNotice from '@/components/chat/ChatErrorNotice';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import { Separator } from '@/components/common/separator';
import type { ChatResponse, ChatTurnData } from '@/types/chat.types';
import ReactMarkdown from 'react-markdown';

type ChatTurnProps = {
  turn: ChatTurnData;
};

export default function ChatTurn({ turn }: ChatTurnProps) {
  return (
    <MessageGroup>
      <ChatBubble role="user">{turn.question}</ChatBubble>
      <AssistantBubble response={turn.response} />
    </MessageGroup>
  );
}

function AssistantBubble({ response }: { response: ChatResponse | null }) {
  if (response === null) {
    return (
      <ChatBubble role="assistant">
        <p className="text-rc-iris-500 animate-pulse">...</p>
      </ChatBubble>
    );
  }

  switch (response.status) {
    case 'ERROR':
      return <ChatErrorNotice />;

    case 'WITHHELD':
      return (
        <ChatBubble role="assistant">
          <p>{response.withheld.message}</p>
        </ChatBubble>
      );

    case 'COMPLETED':
      return (
        <ChatBubble role="assistant">
          <ReactMarkdown>{response.answer.answerMarkdown}</ReactMarkdown>
          <Separator className="mt-2 mb-3 h-[1.2px]" />
          <SourceBadgeList citations={response.citations} />
        </ChatBubble>
      );
  }
}
