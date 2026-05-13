import type { Meta, StoryObj } from '@storybook/react';
import {
  PixelFadeIn,
  PixelSlideIn,
  PixelPulse,
  PixelBounce,
  PixelTypewriter,
  PixelGlitch,
  PixelFloat,
  PixelShake,
  PixelRotate,
  PixelZoomIn,
  PixelFlicker,
} from './animations';
import { AnimatedPxlKitIcon, PxlKitIcon } from '@pxlkit/core';
import { Trophy, FireSword, Crown, Star } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const TRIGGERS = ['mount', 'hover', 'click', 'inView'] as const;

const meta: Meta = {
  title: 'UI Kit / Animations',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

/** Overview — every animation primitive applied to a real animated pxlkit icon. */
export const AllAnimations: Story = {
  render: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl">
      <Frame label="FadeIn">
        <PixelFadeIn><PxlKitIcon icon={Trophy} size={32} colorful /></PixelFadeIn>
      </Frame>
      <Frame label="SlideIn ↑">
        <PixelSlideIn from="up"><PxlKitIcon icon={Crown} size={32} colorful /></PixelSlideIn>
      </Frame>
      <Frame label="Pulse">
        <PixelPulse><AnimatedPxlKitIcon icon={FireSword} size={32} colorful /></PixelPulse>
      </Frame>
      <Frame label="Bounce">
        <PixelBounce><PxlKitIcon icon={Star} size={32} colorful /></PixelBounce>
      </Frame>
      <Frame label="Float">
        <PixelFloat><PxlKitIcon icon={Heart} size={32} colorful /></PixelFloat>
      </Frame>
      <Frame label="Shake (hover)">
        <PixelShake trigger="hover"><PxlKitIcon icon={Trophy} size={32} colorful /></PixelShake>
      </Frame>
      <Frame label="Rotate">
        <PixelRotate><PxlKitIcon icon={Star} size={32} colorful /></PixelRotate>
      </Frame>
      <Frame label="ZoomIn">
        <PixelZoomIn><PxlKitIcon icon={Crown} size={32} colorful /></PixelZoomIn>
      </Frame>
      <Frame label="Flicker">
        <PixelFlicker><AnimatedPxlKitIcon icon={FireSword} size={32} colorful /></PixelFlicker>
      </Frame>
      <Frame label="Glitch (hover)">
        <PixelGlitch trigger="hover"><PxlKitIcon icon={Trophy} size={32} colorful /></PixelGlitch>
      </Frame>
      <Frame label="Typewriter">
        <div className="font-pixel text-[10px] text-retro-green">
          <PixelTypewriter text="PXLKIT_BOOT_OK" />
        </div>
      </Frame>
    </div>
  ),
};

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-retro-border/40 bg-retro-card/30 p-4 min-h-[120px]">
      {children}
      <span className="font-pixel text-[9px] text-retro-muted">{label}</span>
    </div>
  );
}

const childArg = <PxlKitIcon icon={Trophy} size={48} colorful />;

const animationBaseArgs = {
  trigger: 'mount' as const,
  duration: 1000,
  delay: 0,
};

const animationBaseControls = {
  trigger: { control: 'inline-radio', options: TRIGGERS },
  duration: { control: { type: 'number', min: 0, step: 50 } },
  delay: { control: { type: 'number', min: 0, step: 50 } },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelFadeIn
   ────────────────────────────────────────────────────────────────────────── */
export const PixelFadeInStory: Story = {
  name: 'PixelFadeIn',
  render: (args: any) => <PixelFadeIn {...args}>{args.children as React.ReactNode}</PixelFadeIn>,
  argTypes: animationBaseControls,
  args: { ...animationBaseArgs, duration: 400, repeat: 1, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSlideIn
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSlideInStory: Story = {
  name: 'PixelSlideIn',
  render: (args: any) => <PixelSlideIn {...args}>{args.children as React.ReactNode}</PixelSlideIn>,
  argTypes: {
    ...animationBaseControls,
    from: { control: 'inline-radio', options: ['up', 'down', 'left', 'right'] },
    distance: { control: { type: 'number' } },
  },
  args: { ...animationBaseArgs, duration: 350, from: 'down', distance: 10, repeat: 1, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelPulse
   ────────────────────────────────────────────────────────────────────────── */
export const PixelPulseStory: Story = {
  name: 'PixelPulse',
  render: (args: any) => <PixelPulse {...args}>{args.children as React.ReactNode}</PixelPulse>,
  argTypes: animationBaseControls,
  args: { ...animationBaseArgs, duration: 2000, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelBounce
   ────────────────────────────────────────────────────────────────────────── */
export const PixelBounceStory: Story = {
  name: 'PixelBounce',
  render: (args: any) => <PixelBounce {...args}>{args.children as React.ReactNode}</PixelBounce>,
  argTypes: {
    ...animationBaseControls,
    height: { control: { type: 'number' } },
  },
  args: { ...animationBaseArgs, duration: 800, height: 8, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelFloat
   ────────────────────────────────────────────────────────────────────────── */
export const PixelFloatStory: Story = {
  name: 'PixelFloat',
  render: (args: any) => <PixelFloat {...args}>{args.children as React.ReactNode}</PixelFloat>,
  argTypes: {
    ...animationBaseControls,
    distance: { control: { type: 'number' } },
  },
  args: { ...animationBaseArgs, duration: 2200, distance: 6, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelShake
   ────────────────────────────────────────────────────────────────────────── */
export const PixelShakeStory: Story = {
  name: 'PixelShake',
  render: (args: any) => <PixelShake {...args}>{args.children as React.ReactNode}</PixelShake>,
  argTypes: {
    ...animationBaseControls,
    distance: { control: { type: 'number' } },
  },
  args: { ...animationBaseArgs, duration: 450, distance: 2, trigger: 'hover' as const, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelRotate
   ────────────────────────────────────────────────────────────────────────── */
export const PixelRotateStory: Story = {
  name: 'PixelRotate',
  render: (args: any) => <PixelRotate {...args}>{args.children as React.ReactNode}</PixelRotate>,
  argTypes: {
    ...animationBaseControls,
    direction: { control: 'inline-radio', options: ['normal', 'reverse', 'alternate', 'alternate-reverse'] },
  },
  args: { ...animationBaseArgs, duration: 1800, direction: 'normal', children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelZoomIn
   ────────────────────────────────────────────────────────────────────────── */
export const PixelZoomInStory: Story = {
  name: 'PixelZoomIn',
  render: (args: any) => <PixelZoomIn {...args}>{args.children as React.ReactNode}</PixelZoomIn>,
  argTypes: {
    ...animationBaseControls,
    startScale: { control: { type: 'number', min: 0, max: 1, step: 0.01 } },
  },
  args: { ...animationBaseArgs, duration: 320, startScale: 0.92, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelFlicker
   ────────────────────────────────────────────────────────────────────────── */
export const PixelFlickerStory: Story = {
  name: 'PixelFlicker',
  render: (args: any) => <PixelFlicker {...args}>{args.children as React.ReactNode}</PixelFlicker>,
  argTypes: animationBaseControls,
  args: { ...animationBaseArgs, duration: 2200, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelGlitch
   ────────────────────────────────────────────────────────────────────────── */
export const PixelGlitchStory: Story = {
  name: 'PixelGlitch',
  render: (args: any) => <PixelGlitch {...args}>{args.children as React.ReactNode}</PixelGlitch>,
  argTypes: {
    ...animationBaseControls,
    intensity: { control: { type: 'number', min: 1, max: 12 } },
  },
  args: { ...animationBaseArgs, duration: 3000, intensity: 4, trigger: 'hover' as const, children: childArg },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelTypewriter
   ────────────────────────────────────────────────────────────────────────── */
export const PixelTypewriterStory: Story = {
  name: 'PixelTypewriter',
  render: (args: any) => (
    <div className="font-pixel text-sm text-retro-green">
      <PixelTypewriter {...args} />
    </div>
  ),
  argTypes: {
    text: { control: 'text' },
    speed: { control: { type: 'number', min: 0, step: 5 } },
    delay: { control: { type: 'number', min: 0, step: 50 } },
    cursor: { control: 'boolean' },
    tone: { control: 'select', options: TONES },
    trigger: { control: 'inline-radio', options: TRIGGERS },
  },
  args: {
    text: 'PXLKIT_BOOT_OK',
    speed: 60,
    delay: 0,
    cursor: true,
    tone: 'green',
    trigger: 'mount',
  },
};
