import type { Meta, StoryObj } from '@storybook/react';
import { PixelAlert, PixelProgress, PixelSkeleton, PixelEmptyState } from './feedback';
import { PixelButton } from './actions';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { CheckCircle, WarningTriangle, InfoCircle, Bell, ErrorOctagon } from '@pxlkit/feedback';
import { Trophy, FireSword } from '@pxlkit/gamification';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const meta: Meta = {
  title: 'UI Kit / Feedback',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

/** Overview — every feedback component side by side, every tone. */
export const AllFeedback: Story = {
  render: (args: any) => (
    <div className="space-y-6 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green mb-2">PixelAlert — every tone</h3>
        <PixelAlert tone="green" title="QUEST COMPLETE" message="Boss defeated. +500 XP awarded." icon={<PxlKitIcon icon={CheckCircle} size={16} />} surface={args.surface} />
        <PixelAlert tone="cyan" title="NEW INFO" message="A merchant has set up camp nearby." icon={<PxlKitIcon icon={InfoCircle} size={16} />} surface={args.surface} />
        <PixelAlert tone="gold" title="ACHIEVEMENT" message="You earned the Pixel Knight badge." icon={<PxlKitIcon icon={Trophy} size={16} />} surface={args.surface} />
        <PixelAlert tone="red" title="LOW HEALTH" message="Use a potion before the next encounter." icon={<PxlKitIcon icon={ErrorOctagon} size={16} />} action={<PixelButton size="sm" tone="red" variant="ghost" surface={args.surface}>Use potion</PixelButton>} surface={args.surface} />
        <PixelAlert tone="purple" title="EXPERIMENTAL" message="Voxel engine is in beta." icon={<PxlKitIcon icon={WarningTriangle} size={16} />} surface={args.surface} />
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green mb-2">PixelProgress — pixel segmented HP-bar</h3>
        <PixelProgress value={24} label="Uploading" tone="cyan" surface={args.surface} />
        <PixelProgress value={68} label="HP" tone="green" surface={args.surface} />
        <PixelProgress value={92} label="MP" tone="purple" surface={args.surface} />
        <PixelProgress value={100} label="Boss defeated" tone="gold" showValue={false} surface={args.surface} />
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green mb-2">PixelSkeleton</h3>
        <div className="space-y-2 max-w-sm">
          <PixelSkeleton width="60%" height="1rem" surface={args.surface} />
          <PixelSkeleton width="100%" height="0.875rem" surface={args.surface} />
          <PixelSkeleton width="80%" height="0.875rem" surface={args.surface} />
        </div>
      </section>
      <section>
        <h3 className="font-pixel text-xs text-retro-green mb-2">PixelEmptyState</h3>
        <PixelEmptyState
          title="No icons in your inventory"
          description="Open the visual builder or browse one of the 7 packs to start collecting."
          icon={<AnimatedPxlKitIcon icon={FireSword} size={32} />}
          action={<PixelButton tone="green" surface={args.surface}>Open builder</PixelButton>}
          surface={args.surface}
        />
      </section>
    </div>
  ),
  argTypes: {
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { surface: 'pixel' as const },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelAlert
   ────────────────────────────────────────────────────────────────────────── */
export const PixelAlertStory: Story = {
  name: 'PixelAlert',
  render: (args: any) => <PixelAlert {...args} />,
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    title: 'QUEST COMPLETE',
    message: 'Boss defeated. +500 XP awarded.',
    tone: 'green',
    surface: 'pixel',
    icon: <PxlKitIcon icon={CheckCircle} size={16} />,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelProgress
   ────────────────────────────────────────────────────────────────────────── */
export const PixelProgressStory: Story = {
  name: 'PixelProgress',
  render: (args: any) => <div className="w-80"><PixelProgress {...args} /></div>,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    value: 68,
    label: 'HP',
    showValue: true,
    tone: 'green',
    surface: 'pixel',
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSkeleton
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSkeletonStory: Story = {
  name: 'PixelSkeleton',
  render: (args: any) => (
    <div className="space-y-2 w-80">
      <PixelSkeleton {...args} />
      <PixelSkeleton width="100%" height={args.height as string} surface={args.surface} />
      <PixelSkeleton width="80%" height={args.height as string} surface={args.surface} />
    </div>
  ),
  argTypes: {
    width: { control: 'text' },
    height: { control: 'text' },
    rounded: { control: 'boolean' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    width: '60%',
    height: '1rem',
    rounded: false,
    surface: 'pixel',
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelEmptyState
   ────────────────────────────────────────────────────────────────────────── */
export const PixelEmptyStateStory: Story = {
  name: 'PixelEmptyState',
  render: (args: any) => <PixelEmptyState {...args} />,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    title: 'No icons in your inventory',
    description: 'Open the visual builder or browse one of the 7 packs to start collecting.',
    surface: 'pixel',
    icon: <AnimatedPxlKitIcon icon={FireSword} size={32} />,
    action: <PixelButton tone="green">Open builder</PixelButton>,
  },
};
