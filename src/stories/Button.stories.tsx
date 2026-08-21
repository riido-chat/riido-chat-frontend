import type { Meta, StoryObj } from '@storybook/react-vite';
import { FaLocationArrow } from 'react-icons/fa';

import Button from '@/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. 텍스트 버튼
export const TextVariant: Story = {
  args: {
    variant: 'text',
    disabled: false,
    children: '확인하기',
  },
};

// 2. 아이콘 버튼
export const IconVariant: Story = {
  args: {
    variant: 'icon',
    'aria-label': '닫기',
    disabled: false,
    className: 'text-rc-iris-500 hover:text-rc-iris-600',
    children: <FaLocationArrow className="size-6" />,
  },
};
