import type { Meta, StoryObj } from '@storybook/react-vite';

import ChatInput from '@/components/chat/ChatInput';

const meta = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (message) => console.log('Message submitted:', message),
  },
  render: (args) => (
    <div className="w-md">
      <ChatInput {...args} />
    </div>
  ),
};
