import type { Meta, StoryObj } from '@storybook/react';
import { PixelParallaxGroup, PixelParallaxLayer, PixelMouseParallax } from './parallax';
import { ParallaxPxlKitIcon, PxlKitIcon } from '@pxlkit/core';
import { CoolEmoji, PixelHeart, RetroTV } from '@pxlkit/parallax';
import { Trophy, Crown } from '@pxlkit/gamification';

const meta: Meta = {
  title: 'UI Kit / Parallax',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

export const AllParallax: Story = {
  render: () => (
    <div className="space-y-8 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelMouseParallax · move the mouse</h3>
        <PixelParallaxGroup className="rounded-md border-2 border-retro-border/40 bg-retro-card/30 h-64 flex items-center justify-center">
          <div className="relative">
            <PixelMouseParallax strength={20}>
              <ParallaxPxlKitIcon icon={CoolEmoji} size={48} />
            </PixelMouseParallax>
            <div className="h-3" />
            <PixelMouseParallax strength={40}>
              <ParallaxPxlKitIcon icon={PixelHeart} size={56} />
            </PixelMouseParallax>
            <div className="h-3" />
            <PixelMouseParallax strength={60}>
              <ParallaxPxlKitIcon icon={RetroTV} size={64} />
            </PixelMouseParallax>
          </div>
        </PixelParallaxGroup>
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelParallaxLayer · scroll-driven</h3>
        <div className="rounded-md border-2 border-retro-border/40 bg-retro-card/30 h-80 flex items-center justify-center">
          <PixelParallaxLayer speed={0.4}>
            <PxlKitIcon icon={Crown} size={64} />
          </PixelParallaxLayer>
        </div>
      </section>
    </div>
  ),
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelParallaxGroup
   ────────────────────────────────────────────────────────────────────────── */
export const PixelParallaxGroupStory: Story = {
  name: 'PixelParallaxGroup',
  render: (args: any) => (
    <PixelParallaxGroup className="rounded-md border-2 border-retro-border/40 bg-retro-card/30 h-48 flex items-center justify-center" {...args}>
      <PxlKitIcon icon={Trophy} size={48} />
    </PixelParallaxGroup>
  ),
  argTypes: {
    as: { control: 'select', options: ['div', 'section', 'header', 'main'] },
  },
  args: { as: 'div' },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelParallaxLayer
   ────────────────────────────────────────────────────────────────────────── */
export const PixelParallaxLayerStory: Story = {
  name: 'PixelParallaxLayer',
  render: (args: any) => (
    <div className="rounded-md border-2 border-retro-border/40 bg-retro-card/30 h-96 flex items-center justify-center">
      <PixelParallaxLayer {...args}>
        <PxlKitIcon icon={Crown} size={48} />
      </PixelParallaxLayer>
    </div>
  ),
  argTypes: {
    speed: { control: { type: 'number', step: 0.1 } },
    axis: { control: 'inline-radio', options: ['x', 'y', 'both'] },
  },
  args: { speed: 0.4, axis: 'y' },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelMouseParallax
   ────────────────────────────────────────────────────────────────────────── */
export const PixelMouseParallaxStory: Story = {
  name: 'PixelMouseParallax',
  render: (args: any) => (
    <PixelParallaxGroup className="rounded-md border-2 border-retro-border/40 bg-retro-card/30 h-64 flex items-center justify-center">
      <PixelMouseParallax {...args}>
        <ParallaxPxlKitIcon icon={CoolEmoji} size={56} />
      </PixelMouseParallax>
    </PixelParallaxGroup>
  ),
  argTypes: {
    strength: { control: { type: 'number' } },
    invert: { control: 'boolean' },
  },
  args: { strength: 30, invert: false },
};
