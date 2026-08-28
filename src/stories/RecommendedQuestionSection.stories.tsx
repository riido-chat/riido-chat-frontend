import type { Meta, StoryObj } from '@storybook/react-vite';

import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { Card, CardContent } from '@/components/common/card';

const meta = {
  title: 'Chat/RecommendedQuestionSection',
  component: RecommendedQuestionSection,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof RecommendedQuestionSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onQuestionSelect: (question) => console.log('Recommended question selected:', question),
    isExpanded: false,
    onExpand: () => console.log('Recommended questions expanded'),
  },
  render: (args) => (
    <Card className="h-200 w-md">
      <CardContent className="flex flex-col">
        <RecommendedQuestionSection {...args} />
      </CardContent>
    </Card>
  ),
};
