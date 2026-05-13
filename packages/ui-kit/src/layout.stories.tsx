import type { Meta, StoryObj } from '@storybook/react';
import { PixelSection, PixelDivider } from './layout';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const meta: Meta = {
  title: 'UI Kit / Layout',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

export const AllLayout: Story = {
  render: (args: any) => (
    <div className="space-y-8 max-w-3xl">
      <PixelSection title="Quickstart" subtitle="Install, import, ship" surface={args.surface}>
        <p className="text-retro-muted text-sm">
          PixelSection wraps content with a title row, optional subtitle, and consistent spacing.
        </p>
      </PixelSection>
      <PixelDivider label="OR" surface={args.surface} />
      <PixelSection title="Theming" subtitle="Bring your own palette" surface={args.surface}>
        <p className="text-retro-muted text-sm">
          Override any <code className="text-retro-cyan">--retro-*</code> CSS variable to retheme every component in one swap.
        </p>
      </PixelSection>
      <PixelDivider surface={args.surface} />
      <PixelSection title="Tone-tinted dividers" surface={args.surface}>
        <div className="space-y-3">
          <PixelDivider label="GREEN ZONE" tone="green" surface={args.surface} />
          <PixelDivider label="DANGER" tone="red" surface={args.surface} />
          <PixelDivider label="VIP" tone="gold" surface={args.surface} />
        </div>
      </PixelSection>
    </div>
  ),
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSection
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSectionStory: Story = {
  name: 'PixelSection',
  render: (args: any) => (
    <PixelSection {...args}>
      <p className="text-retro-muted text-sm">Section body content. Anything you drop in here inherits the active surface.</p>
    </PixelSection>
  ),
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    title: 'Quickstart',
    subtitle: 'Install, import, ship',
    surface: 'pixel',
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelDivider
   ────────────────────────────────────────────────────────────────────────── */
export const PixelDividerStory: Story = {
  name: 'PixelDivider',
  render: (args: any) => (
    <div className="w-96 space-y-4">
      <PixelDivider {...args} />
      <PixelDivider label="" surface={args.surface} />
    </div>
  ),
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    spacing: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    label: 'CHAPTER 1',
    tone: 'gold',
    spacing: 'none',
    surface: 'pixel',
  },
};
