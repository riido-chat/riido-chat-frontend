import type { Meta, StoryObj } from '@storybook/react-vite';

import NavBar from '@/components/chat/NavBar';
import { Card } from '@/components/common/card';

const meta = {
  title: 'Chat/NavBar',
  component: NavBar,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavigationStates: Story = {
  args: {
    children: 'Riido RAG Chatbot',
  },
  render: () => (
    <div className="flex w-md flex-col gap-6">
      <section className="space-y-2">
        <p className="text-label text-label-assistive">추천 질문(홈)</p>
        <Card>
          <NavBar>뤼이도 RAG 챗봇</NavBar>
        </Card>
      </section>

      <section className="space-y-2">
        <p className="text-label text-label-assistive">추천 질문 펼침</p>
        <Card>
          <NavBar onGoHome={() => console.log('Go to home')}>뤼이도 RAG 챗봇</NavBar>
        </Card>
      </section>

      <section className="space-y-2">
        <p className="text-label text-label-assistive">채팅 중</p>
        <Card>
          <NavBar onEndChat={() => console.log('End chat')}>뤼이도 RAG 챗봇</NavBar>
        </Card>
      </section>
    </div>
  ),
};
