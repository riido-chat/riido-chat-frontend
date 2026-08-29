import type { Meta, StoryObj } from '@storybook/react-vite';

import ChatBubble from '@/components/chat/ChatBubble';
import ChatTurn from '@/components/chat/ChatTurn';
import { Card } from '@/components/common/card';
import { mockChatResponse } from '@/mocks/chat';
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

        <p className="text-label text-label-assistive">챗봇 답변</p>
        <ChatBubble role="assistant">
          <ReactMarkdown>{mockChatResponse.answer.answerMarkdown}</ReactMarkdown>
        </ChatBubble>
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
      <ChatTurn
        turn={{
          id: 'story-turn',
          question: '팀 단위 작업은 어떻게 생성하나요?',
          response: mockChatResponse,
        }}
      />
    </Card>
  ),
};
