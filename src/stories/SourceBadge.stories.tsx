import type { Meta, StoryObj } from '@storybook/react-vite';

import SourceBadge from '@/components/chat/SourceBadge';
import SourceBadgeList from '@/components/chat/SourceBadgeList';
import { mockCitations } from '@/mocks/citations';

const meta = {
  title: 'Chat/SourceBadge',
  component: SourceBadge,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof SourceBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CitationStates: Story = {
  args: {
    citation: mockCitations[0],
  },
  render: (args) => (
    <div className="flex w-md flex-col gap-6">
      <section className="space-y-2">
        <p className="text-label text-label-assistive">단일 출처</p>
        <SourceBadge {...args} />
      </section>

      <section className="space-y-2">
        <p className="text-label text-label-assistive">복수 출처</p>
        <SourceBadgeList citations={mockCitations} />
      </section>
    </div>
  ),
};
