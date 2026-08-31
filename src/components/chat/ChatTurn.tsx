import ChatBubble from '@/components/chat/ChatBubble';
import ChatErrorNotice from '@/components/chat/ChatErrorNotice';
import ChatWithheldBubble from '@/components/chat/ChatWithheldBubble';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { MessageGroup } from '@/components/common/message';
import { Separator } from '@/components/common/separator';
import type { ChatTurnData, ChatTurnResponse } from '@/types/chat.types';
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

function AssistantBubble({ response }: { response: ChatTurnResponse | null }) {
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

    case 'ABORTED':
      return (
        <ChatBubble role="assistant">
          <p className="text-label-assistive">답변이 중단되었습니다.</p>
        </ChatBubble>
      );

    // WITHHELD도 평가 대상이다. 보류 사유가 적절했는지 사용자에게 피드백을 받는다.
    case 'WITHHELD':
      return (
        <ChatBubble role="assistant" ragRunId={response.ragRunId}>
          <ChatWithheldBubble reasonCode={response.withheld.reasonCode} />
        </ChatBubble>
      );

    case 'COMPLETED':
      return (
        <ChatBubble role="assistant" ragRunId={response.ragRunId}>
          <ReactMarkdown>{response.answer.answerMarkdown}</ReactMarkdown>
          <Separator className="mt-2 mb-3 h-[1.2px]" />
          <SourceBadgeList citations={response.citations} />
        </ChatBubble>
      );
  }
}
