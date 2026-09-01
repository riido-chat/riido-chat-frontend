import type { Meta, StoryObj } from '@storybook/react-vite';

import ChatBubble from '@/components/chat/ChatBubble';
import ChatTurn from '@/components/chat/ChatTurn';
import { Card } from '@/components/common/card';
import { mockChatResponse } from '@/mocks/chat';
import type { ErrorChatResponse, FeedbackRating } from '@/types/chat.types';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const meta = {
  title: 'Chat/ChatBubble',
  component: ChatBubble,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

// 실제 앱에서는 FloatingChat이 평가 상태를 관리하지만, 스토리에서는 지역 상태로 대신한다.
function FeedbackBubblePreview() {
  const [rating, setRating] = useState<FeedbackRating | null>(null);

  return (
    <ChatBubble
      role="assistant"
      ragRunId={mockChatResponse.ragRunId}
      rating={rating}
      onRatingChange={setRating}
    >
      <ReactMarkdown>{mockChatResponse.answer.answerMarkdown}</ReactMarkdown>
    </ChatBubble>
  );
}

function ChatTurnPreview() {
  const [rating, setRating] = useState<FeedbackRating | null>(null);

  return (
    <ChatTurn
      turn={{
        id: 'story-turn',
        question: '팀 단위 작업은 어떻게 생성하나요?',
        response: mockChatResponse,
        rating,
      }}
      onRatingChange={setRating}
      onRetry={() => console.log('Retry requested')}
    />
  );
}

const retryableErrorResponse = {
  status: 'ERROR',
  conversationId: null,
  ragRunId: null,
  answer: null,
  error: {
    code: 'SERVICE_UNAVAILABLE',
    message: '일시적인 오류가 발생했습니다.',
    retryable: true,
  },
  citations: [],
} satisfies ErrorChatResponse;

const nonRetryableErrorResponse = {
  ...retryableErrorResponse,
  error: {
    code: 'INVALID_REQUEST',
    message: '요청을 처리할 수 없습니다.',
    retryable: false,
  },
} satisfies ErrorChatResponse;

function ErrorTurnPreview({ response }: { response: ErrorChatResponse }) {
  return (
    <ChatTurn
      turn={{
        id: `error-${response.error.code}`,
        question: '업무 위임 작업은 어떻게 생성하나요?',
        response,
        rating: null,
      }}
      onRatingChange={() => undefined}
      onRetry={() => console.log('Retry requested')}
    />
  );
}

export const IndividualMessages: Story = {
  args: {
    role: 'user',
    children: '팀 단위 작업은 어떻게 생성하나요?',
  },
  render: () => (
    <Card className="w-md p-4">
      <div className="flex flex-col gap-4">
        <p className="text-label text-label-assistive">사용자 질문</p>
        <ChatBubble role="user">팀 단위 작업은 어떻게 생성하나요?</ChatBubble>

        <p className="text-label text-label-assistive">챗봇 답변 (피드백 포함)</p>
        <FeedbackBubblePreview />
      </div>
    </Card>
  ),
};

export const QuestionAnswerTurn: Story = {
  args: {
    role: 'user',
    children: '팀 단위 작업은 어떻게 생성하나요?',
  },
  render: () => (
    <Card className="w-md p-4">
      <ChatTurnPreview />
    </Card>
  ),
};

export const ErrorStates: Story = {
  args: {
    role: 'assistant',
    children: null,
  },
  render: () => (
    <Card className="w-md p-4">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <p className="text-label text-label-assistive">재시도 가능</p>
          <ErrorTurnPreview response={retryableErrorResponse} />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-label text-label-assistive">재시도 불가</p>
          <ErrorTurnPreview response={nonRetryableErrorResponse} />
        </section>
      </div>
    </Card>
  ),
};
