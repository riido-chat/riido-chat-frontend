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
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'icon', 'ghost', 'link'],
      description: '버튼의 색상 계열을 결정합니다.',
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
      description: '높이와 좌우 여백, 내부 아이콘 크기를 함께 결정합니다.',
    },
    disabled: {
      control: 'boolean',
      description: '비활성 상태에서는 투명도가 낮아지고 포인터 이벤트가 차단됩니다.',
    },
    children: {
      control: 'text',
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    children: '확인하기',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextButton: Story = {};

export const IconButton: Story = {
  args: {
    variant: 'default',
  },

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
