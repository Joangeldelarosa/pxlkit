import type { Meta, StoryObj } from '@storybook/react';
import {
  PixelCard,
  PixelStatCard,
  PixelTable,
  PixelAvatar,
  PixelBadge,
  PixelChip,
  PixelTextLink,
  PixelCollapsible,
  PixelCodeInline,
  PixelKbd,
  PixelColorSwatch,
  PixelBareButton,
  PixelBareInput,
  PixelBareTextarea,
} from './data-display';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Trophy, Crown, Star, FireSword } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const COLS = [
  { key: 'pack', header: 'Pack', className: 'w-1/3' },
  { key: 'icons', header: 'Icons' },
  { key: 'status', header: 'Status' },
];
const ROWS = [
  { pack: 'gamification', icons: '51', status: <PixelBadge tone="green">stable</PixelBadge> },
  { pack: 'feedback', icons: '33', status: <PixelBadge tone="green">stable</PixelBadge> },
  { pack: 'social', icons: '43', status: <PixelBadge tone="green">stable</PixelBadge> },
  { pack: 'parallax', icons: '10', status: <PixelBadge tone="cyan">3D</PixelBadge> },
  { pack: 'voxel', icons: '1', status: <PixelBadge tone="gold">v0.1.x</PixelBadge> },
];

const meta: Meta = {
  title: 'UI Kit / Data Display',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

/** Overview — every display component in one frame. */
export const AllDataDisplay: Story = {
  render: (args: any) => (
    <div className="space-y-8 max-w-5xl">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PixelStatCard label="Components" value="54" icon={<PxlKitIcon icon={Crown} size={14} colorful />} tone="green" trend="+12 this release" surface={args.surface} />
        <PixelStatCard label="Icons" value="226+" icon={<PxlKitIcon icon={Trophy} size={14} colorful />} tone="gold" surface={args.surface} />
        <PixelStatCard label="Templates" value="29" icon={<PxlKitIcon icon={Star} size={14} colorful />} tone="purple" trend="24 sections + 5 pages" surface={args.surface} />
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PixelCard title="Inventory" icon={<AnimatedPxlKitIcon icon={FireSword} size={16} colorful />} surface={args.surface} footer={<PixelTextLink href="#" surface={args.surface}>Read more →</PixelTextLink>}>
          A container with title, icon, body, and optional footer.
        </PixelCard>
        <PixelCard title="Tags" icon={<PxlKitIcon icon={Star} size={16} colorful />} surface={args.surface}>
          <div className="flex flex-wrap gap-2">
            <PixelChip label="React" tone="cyan" surface={args.surface} />
            <PixelChip label="TypeScript" tone="purple" surface={args.surface} />
            <PixelChip label="Tailwind" tone="green" onRemove={() => {}} surface={args.surface} />
          </div>
        </PixelCard>
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelTable</h3>
        <PixelTable columns={COLS} data={ROWS} surface={args.surface} />
      </section>
      <section className="flex flex-wrap items-center gap-4">
        <PixelAvatar name="Joangel De La Rosa" surface={args.surface} />
        <PixelAvatar name="Pixel Hero" tone="purple" surface={args.surface} />
        <PixelAvatar name="A" size="sm" tone="gold" surface={args.surface} />
        <PixelAvatar name="Retro Knight" size="lg" tone="cyan" surface={args.surface} />
      </section>
      <section className="flex flex-wrap items-center gap-2">
        {TONES.map((t) => <PixelBadge key={t} tone={t} surface={args.surface}>{t}</PixelBadge>)}
      </section>
    </div>
  ),
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

/* Individual stories per component */
export const PixelCardStory: Story = {
  name: 'PixelCard',
  render: (args: any) => (
    <PixelCard {...args} footer={<PixelTextLink href="#" surface={args.surface}>Read more →</PixelTextLink>}>
      {args.children as React.ReactNode}
    </PixelCard>
  ),
  argTypes: {
    title: { control: 'text' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    title: 'Inventory',
    surface: 'pixel',
    icon: <AnimatedPxlKitIcon icon={FireSword} size={16} colorful />,
    children: 'A container with title, icon, body, and optional footer.',
  },
};

export const PixelStatCardStory: Story = {
  name: 'PixelStatCard',
  render: (args: any) => <div className="w-72"><PixelStatCard {...args} /></div>,
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    trend: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    label: 'Components',
    value: '54',
    trend: '+12 this release',
    tone: 'green',
    surface: 'pixel',
    icon: <PxlKitIcon icon={Crown} size={14} colorful />,
  },
};

export const PixelTableStory: Story = {
  name: 'PixelTable',
  render: (args: any) => <PixelTable {...args} />,
  argTypes: {
    striped: { control: 'boolean' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { columns: COLS, data: ROWS, striped: true, surface: 'pixel' },
};

export const PixelAvatarStory: Story = {
  name: 'PixelAvatar',
  render: (args: any) => <PixelAvatar {...args} />,
  argTypes: {
    name: { control: 'text' },
    src: { control: 'text' },
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { name: 'Joangel De La Rosa', size: 'md', tone: 'green', surface: 'pixel' },
};

export const PixelBadgeStory: Story = {
  name: 'PixelBadge',
  render: (args: any) => <PixelBadge {...args}>{args.children as React.ReactNode}</PixelBadge>,
  argTypes: {
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    children: { control: 'text' },
  },
  args: { tone: 'green', surface: 'pixel', children: 'stable' },
};

export const PixelChipStory: Story = {
  name: 'PixelChip',
  render: (args: any) => <PixelChip {...args} onRemove={() => console.log('remove')} />,
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { label: 'React', tone: 'cyan', surface: 'pixel' },
};

export const PixelTextLinkStory: Story = {
  name: 'PixelTextLink',
  render: (args: any) => <PixelTextLink {...args}>{args.children as React.ReactNode}</PixelTextLink>,
  argTypes: {
    href: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    children: { control: 'text' },
  },
  args: { href: 'https://pxlkit.xyz', tone: 'cyan', surface: 'pixel', children: 'Browse all icons →' },
};

export const PixelCollapsibleStory: Story = {
  name: 'PixelCollapsible',
  render: (args: any) => (
    <PixelCollapsible {...args}>
      <p className="text-sm text-retro-muted">{args.children as React.ReactNode}</p>
    </PixelCollapsible>
  ),
  argTypes: {
    label: { control: 'text' },
    defaultOpen: { control: 'boolean' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    children: { control: 'text' },
  },
  args: {
    label: 'Show advanced settings',
    defaultOpen: false,
    tone: 'cyan',
    surface: 'pixel',
    children: 'Advanced settings would live here.',
  },
};

export const PixelCodeInlineStory: Story = {
  name: 'PixelCodeInline',
  render: (args: any) => (
    <p className="text-sm text-retro-muted">
      Run <PixelCodeInline {...args}>{args.children as React.ReactNode}</PixelCodeInline> to install.
    </p>
  ),
  argTypes: {
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    children: { control: 'text' },
  },
  args: { tone: 'cyan', surface: 'pixel', children: 'npm install @pxlkit/ui-kit' },
};

export const PixelKbdStory: Story = {
  name: 'PixelKbd',
  render: (args: any) => (
    <p className="text-sm text-retro-muted">
      Press <PixelKbd {...args}>⌘</PixelKbd> + <PixelKbd surface={args.surface}>K</PixelKbd> to open the command palette.
    </p>
  ),
  argTypes: {
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { surface: 'pixel' },
};

export const PixelColorSwatchStory: Story = {
  name: 'PixelColorSwatch',
  render: (args: any) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
      <PixelColorSwatch name="green" cssVar="--color-retro-green" surface={args.surface} />
      <PixelColorSwatch name="cyan" cssVar="--color-retro-cyan" surface={args.surface} />
      <PixelColorSwatch name="gold" cssVar="--color-retro-gold" surface={args.surface} />
      <PixelColorSwatch name="purple" cssVar="--color-retro-purple" surface={args.surface} />
      <PixelColorSwatch name="red" cssVar="--color-retro-red" surface={args.surface} />
      <PixelColorSwatch name="pink" cssVar="--color-retro-pink" surface={args.surface} />
    </div>
  ),
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

/* Bare primitives — pass-through, no styling */
export const PixelBareButtonStory: Story = {
  name: 'PixelBareButton',
  render: (args: any) => <PixelBareButton {...args}>{(args as { children?: React.ReactNode }).children ?? 'Bare button'}</PixelBareButton>,
  args: { children: 'PixelBareButton — minimal click target' },
};

export const PixelBareInputStory: Story = {
  name: 'PixelBareInput',
  render: (args: any) => <PixelBareInput {...args} />,
  args: { placeholder: 'PixelBareInput — no shell, just the input' },
};

export const PixelBareTextareaStory: Story = {
  name: 'PixelBareTextarea',
  render: (args: any) => <PixelBareTextarea {...args} />,
  args: { placeholder: 'PixelBareTextarea — for low-chrome contexts', rows: 3 },
};
