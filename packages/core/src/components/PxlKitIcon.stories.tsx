import type { Meta, StoryObj } from '@storybook/react';
import { PxlKitIcon } from './PxlKitIcon';
import type { PxlKitData } from '../types';

const demoIcon: PxlKitData = {
  name: 'demo-icon',
  size: 16,
  category: 'demo',
  grid: [
    '................',
    '................',
    '..RRRRRRRRRR....',
    '..R........R....',
    '..R..GGGG..R....',
    '..R..GGGG..R....',
    '..R..GGGG..R....',
    '..R..GGGG..R....',
    '..R........R....',
    '..RRRRRRRRRR....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '......BBBB......',
    '......BBBB......',
    '....BBBBBBBB....',
    '................',
  ],
  palette: {
    R: '#FFD700',
    G: '#FFC107',
    B: '#B8860B',
  },
  tags: ['demo', 'trophy'],
};

const meta: Meta<typeof PxlKitIcon> = {
  title: 'Core/PxlKitIcon',
  component: PxlKitIcon,
  tags: ['autodocs'],
  args: {
    icon: demoIcon,
    size: 64,
  },
};

export default meta;
type Story = StoryObj<typeof PxlKitIcon>;

export const Default: Story = {
  name: 'Monochrome (Default)',
  args: {
    colorful: false,
  },
};

export const Colorful: Story = {
  args: {
    colorful: true,
  },
};

export const CustomColor: Story = {
  args: {
    colorful: false,
    color: '#00ff88',
  },
};

export const Size16: Story = {
  name: 'Size 16px',
  args: {
    size: 16,
    colorful: true,
  },
};

export const Size32: Story = {
  name: 'Size 32px',
  args: {
    size: 32,
    colorful: true,
  },
};

export const Size48: Story = {
  name: 'Size 48px',
  args: {
    size: 48,
    colorful: true,
  },
};

export const Size64: Story = {
  name: 'Size 64px',
  args: {
    size: 64,
    colorful: true,
  },
};

export const Size128: Story = {
  name: 'Size 128px',
  args: {
    size: 128,
    colorful: true,
  },
};

export const WithClassName: Story = {
  args: {
    colorful: true,
    className: 'opacity-50',
  },
};

export const WithAriaLabel: Story = {
  args: {
    colorful: true,
    'aria-label': 'Golden trophy icon',
  },
};
