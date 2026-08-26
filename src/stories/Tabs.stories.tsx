import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';

const meta = {
  title: 'Common/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-md">
      <Tabs defaultValue="team">
        <TabsList className="self-center">
          <TabsTrigger value="team">팀</TabsTrigger>
          <TabsTrigger value="task">작업</TabsTrigger>
          <TabsTrigger value="meeting">미팅</TabsTrigger>
          <TabsTrigger value="sprint">스프린트</TabsTrigger>
        </TabsList>

        <TabsContent value="team">팀 탭의 콘텐츠입니다.</TabsContent>
        <TabsContent value="task">작업 탭의 콘텐츠입니다.</TabsContent>
        <TabsContent value="meeting">미팅 탭의 콘텐츠입니다.</TabsContent>
        <TabsContent value="sprint">스프린트 탭의 콘텐츠입니다.</TabsContent>
      </Tabs>
    </div>
  ),
};
