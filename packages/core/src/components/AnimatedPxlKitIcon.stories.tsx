import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedPxlKitIcon } from './AnimatedPxlKitIcon';
import type { AnimatedPxlKitData } from '../types';

const demoAnimatedIcon: AnimatedPxlKitData = {
  name: 'demo-animated',
  size: 16,
  category: 'demo',
  palette: {
    R: '#FF4500',
    O: '#FF8C00',
    Y: '#FFD700',
    W: '#FFFFFF',
  },
  frames: [
    {
      grid: [
        '................',
        '......RRR.......',
        '.....RRRRR......',
        '....RRRRRRR.....',
        '....RRRRRRR.....',
        '.....RRRRR......',
        '......RRR.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......OOO.......',
        '.....OOOOO......',
        '....OOOOOOO.....',
        '....OOOOOOO.....',
        '.....OOOOO......',
        '......OOO.......',
        '........Y.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......YYY.......',
        '.....YYYYY......',
        '....YYYYYYY.....',
        '....YYYYYYY.....',
        '.....YYYYY......',
        '......YYY.......',
        '.......YY.......',
        '........W.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 150,
  loop: true,
  tags: ['demo', 'animated', 'fire'],
};

const meta: Meta<typeof AnimatedPxlKitIcon> = {
  title: 'Core/AnimatedPxlKitIcon',
  component: AnimatedPxlKitIcon,
  tags: ['autodocs'],
  args: {
    icon: demoAnimatedIcon,
    size: 64,
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedPxlKitIcon>;

export const Loop: Story = {
  args: {
    trigger: 'loop',
    colorful: true,
  },
};

export const HoverTrigger: Story = {
  args: {
    trigger: 'hover',
    colorful: true,
  },
};

export const OnceTrigger: Story = {
  args: {
    trigger: 'once',
    colorful: true,
  },
};

export const PingPongTrigger: Story = {
  args: {
    trigger: 'ping-pong',
    colorful: true,
  },
};

export const DoubleSpeed: Story = {
  name: '2x Speed',
  args: {
    trigger: 'loop',
    colorful: true,
    speed: 2,
  },
};

export const HalfSpeed: Story = {
  name: '0.5x Speed',
  args: {
    trigger: 'loop',
    colorful: true,
    speed: 0.5,
  },
};

export const CustomFps: Story = {
  name: 'Custom FPS (4)',
  args: {
    trigger: 'loop',
    colorful: true,
    fps: 4,
  },
};

export const Paused: Story = {
  args: {
    trigger: 'loop',
    colorful: true,
    playing: false,
  },
};

export const Monochrome: Story = {
  args: {
    trigger: 'loop',
    colorful: false,
    color: '#00ff88',
  },
};
