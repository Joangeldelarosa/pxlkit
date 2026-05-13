import type { Meta, StoryObj } from '@storybook/react';
import { PixelButton, PxlKitButton, PixelSplitButton } from './actions';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Trophy, FireSword, Crown, Star } from '@pxlkit/gamification';
import { CheckCircle, Bell } from '@pxlkit/feedback';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const meta: Meta = {
  title: 'UI Kit / Actions',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<any>;

/** Overview — every action component side by side, every tone, every surface. */
export const AllActions: Story = {
  render: (args: any) => (
    <div className="space-y-6 max-w-3xl">
      <section>
        <h3 className="font-pixel text-xs text-retro-green mb-3">PixelButton — every tone</h3>
        <div className="flex flex-wrap gap-3">
          {TONES.map((t) => (
            <PixelButton key={t} tone={t} surface={args.surface}>{t}</PixelButton>
          ))}
        </div>
      </section>
      <section>
        <h3 className="font-pixel text-xs text-retro-green mb-3">Sizes &amp; variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <PixelButton size="sm" surface={args.surface}>Small</PixelButton>
          <PixelButton size="md" surface={args.surface}>Medium</PixelButton>
          <PixelButton size="lg" surface={args.surface}>Large</PixelButton>
          <PixelButton variant="ghost" tone="cyan" surface={args.surface}>Ghost</PixelButton>
          <PixelButton iconLeft={<PxlKitIcon icon={Trophy} size={14} />} surface={args.surface}>Trophy</PixelButton>
          <PixelButton iconRight={<PxlKitIcon icon={Crown} size={14} />} tone="gold" surface={args.surface}>Crown</PixelButton>
          <PixelButton loading tone="purple" surface={args.surface}>Working</PixelButton>
          <PixelButton disabled surface={args.surface}>Disabled</PixelButton>
        </div>
      </section>
      <section>
        <h3 className="font-pixel text-xs text-retro-green mb-3">PxlKitButton — icon-only with animated icons</h3>
        <div className="flex items-center gap-3">
          <PxlKitButton label="Quest" icon={<AnimatedPxlKitIcon icon={FireSword} size={18} />} size="sm" surface={args.surface} />
          <PxlKitButton label="Notification" icon={<PxlKitIcon icon={Bell} size={18} />} size="md" tone="cyan" surface={args.surface} />
          <PxlKitButton label="Achievement" icon={<PxlKitIcon icon={Star} size={20} />} size="lg" tone="gold" surface={args.surface} />
        </div>
      </section>
      <section>
        <h3 className="font-pixel text-xs text-retro-green mb-3">PixelSplitButton</h3>
        <PixelSplitButton
          label="Save"
          tone="green"
          surface={args.surface}
          options={[
            { value: 'draft', label: 'Save as draft' },
            { value: 'copy', label: 'Save a copy' },
            { value: 'export', label: 'Save and export' },
          ]}
          onPrimary={() => console.log('Save primary')}
          onSelect={(v) => console.log('split select', v)}
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
   PixelButton — versatile action button with tone, size, variant, surface.
   ────────────────────────────────────────────────────────────────────────── */
export const PixelButtonStory: Story = {
  name: 'PixelButton',
  render: (args: any) => (
    <PixelButton {...args}>
      {args.children as React.ReactNode}
    </PixelButton>
  ),
  argTypes: {
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    variant: { control: 'inline-radio', options: ['solid', 'ghost'] },
    surface: { control: 'inline-radio', options: SURFACES },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    tone: 'green',
    size: 'md',
    variant: 'solid',
    surface: 'pixel',
    loading: false,
    disabled: false,
    children: 'Start Quest',
    iconLeft: <PxlKitIcon icon={Trophy} size={14} />,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PxlKitButton — icon-only square button with accessible label.
   ────────────────────────────────────────────────────────────────────────── */
export const PxlKitButtonStory: Story = {
  name: 'PxlKitButton',
  render: (args: any) => <PxlKitButton {...args} />,
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Open quest log',
    tone: 'cyan',
    size: 'md',
    surface: 'pixel',
    disabled: false,
    icon: <AnimatedPxlKitIcon icon={FireSword} size={18} />,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSplitButton — primary action + chevron dropdown for secondary options.
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSplitButtonStory: Story = {
  name: 'PixelSplitButton',
  render: (args: any) => (
    <PixelSplitButton
      {...args}
      onPrimary={() => console.log('primary')}
      onSelect={(v) => console.log('select', v)}
    />
  ),
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Export',
    tone: 'purple',
    surface: 'pixel',
    disabled: false,
    options: [
      { value: 'png', label: 'Export as PNG' },
      { value: 'svg', label: 'Export as SVG' },
      { value: 'json', label: 'Export icon code' },
    ],
  },
};
