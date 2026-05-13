import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedPxlKitIcon } from './AnimatedPxlKitIcon';
import type { AnimatedPxlKitData } from '../types';

/**
 * AnimatedPxlKitIcon — Storybook surface.
 *
 * Uses the canonical v1.3 API: `appearance` + optional `color`. Covers every
 * value of `AnimationTrigger` ('loop' | 'once' | 'hover' | 'appear' |
 * 'ping-pong') plus speed / fps / playing / appearance customisation.
 */
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
  argTypes: {
    appearance: {
      control: 'radio',
      options: ['palette', 'tinted', 'solid'],
      description: "Colour mode applied to every frame.",
    },
    color: {
      control: 'color',
      description: "Tint hue (when appearance='tinted') or flat colour (when appearance='solid').",
    },
    trigger: {
      control: 'select',
      options: ['loop', 'once', 'hover', 'appear', 'ping-pong'],
      description: "Playback policy. See https://pxlkit.xyz/docs#animated-icons.",
    },
    speed: {
      control: { type: 'number', min: 0.1, max: 10, step: 0.1 },
      description: "Frame-duration multiplier. 2 = double speed, 0.5 = half. Ignored when `fps` is set.",
    },
    fps: {
      control: { type: 'number', min: 1, max: 60, step: 1 },
      description: "Fixed FPS. Takes priority over both `speed` and `icon.frameDuration`.",
    },
    playing: {
      control: 'boolean',
      description: "Manual play/pause override. Leave undefined to let the trigger drive playback.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedPxlKitIcon>;

// ── Trigger modes (covers all 5 AnimationTrigger values) ────────────────

export const Loop: Story = {
  args: {
    trigger: 'loop',
    appearance: 'palette',
  },
};

export const Once: Story = {
  name: 'Trigger: once',
  args: {
    trigger: 'once',
    appearance: 'palette',
  },
};

export const Hover: Story = {
  name: 'Trigger: hover',
  args: {
    trigger: 'hover',
    appearance: 'palette',
  },
};

export const Appear: Story = {
  name: 'Trigger: appear (plays on scroll into view)',
  args: {
    trigger: 'appear',
    appearance: 'palette',
  },
};

export const PingPong: Story = {
  name: 'Trigger: ping-pong',
  args: {
    trigger: 'ping-pong',
    appearance: 'palette',
  },
};

// ── Speed / FPS control ────────────────────────────────────────────────

export const DoubleSpeed: Story = {
  name: '2× speed',
  args: {
    trigger: 'loop',
    appearance: 'palette',
    speed: 2,
  },
};

export const HalfSpeed: Story = {
  name: '0.5× speed',
  args: {
    trigger: 'loop',
    appearance: 'palette',
    speed: 0.5,
  },
};

export const CustomFps: Story = {
  name: 'Fixed 4 fps',
  args: {
    trigger: 'loop',
    appearance: 'palette',
    fps: 4,
  },
};

// ── Playback control ───────────────────────────────────────────────────

export const Paused: Story = {
  args: {
    trigger: 'loop',
    appearance: 'palette',
    playing: false,
  },
};

// ── Colour modes ───────────────────────────────────────────────────────

export const TintedGreen: Story = {
  name: 'appearance="tinted" — green overlay',
  args: {
    trigger: 'loop',
    appearance: 'tinted',
    color: '#00ff88',
  },
};

export const SolidGreen: Story = {
  name: 'appearance="solid" — flat green',
  args: {
    trigger: 'loop',
    appearance: 'solid',
    color: '#00ff88',
  },
};
