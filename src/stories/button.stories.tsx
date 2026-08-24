import type { Meta, StoryObj } from '@storybook/react-vite';
import { IoIosArrowBack } from 'react-icons/io';
import { FaStop } from 'react-icons/fa';
import { Button } from '@/components/common/button';
import { IoSend } from 'react-icons/io5';

const meta = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="default"
        size="lg"
        className="w-60.5"
        onClick={() => console.log('Default button clicked')}
      >
        1:1 상담 연결하기
      </Button>
      <Button variant="ghost" size="default" onClick={() => console.log('Ghost button clicked')}>
        추천 질문 더보기
      </Button>
      <Button variant="link" size="default" onClick={() => console.log('Link button clicked')}>
        1:1 상담
      </Button>
    </div>
  ),
};

export const IconButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="icon" size="icon-lg" onClick={() => console.log('Icon button1 clicked')}>
        <IoSend className="size-icon-lg rotate-330" />
      </Button>

      <Button variant="icon" size="icon-lg" onClick={() => console.log('Icon button2 clicked')}>
        <FaStop className="size-icon-sm" />
      </Button>

      <Button variant="icon" size="icon-sm" onClick={() => console.log('Icon button3 clicked')}>
        <IoIosArrowBack className="size-icon-sm" />
      </Button>
    </div>
  ),
};
