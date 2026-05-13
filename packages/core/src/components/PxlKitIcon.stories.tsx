import type { Meta, StoryObj } from '@storybook/react';
import { PxlKitIcon } from './PxlKitIcon';
import type { PxlKitData } from '../types';

/**
 * PxlKitIcon — Storybook surface.
 *
 * Every story uses the canonical v1.3 API: `appearance` + optional `color`.
 * The legacy `colorful` / `solid` / `tint` props still resolve at runtime
 * (kept as aliases for v1.2 consumers) but they are NOT exercised here so
 * Storybook autodocs reflect the current public contract.
 */
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
  argTypes: {
    appearance: {
      control: 'radio',
      options: ['palette', 'tinted', 'solid'],
      description:
        'Colour mode. `palette` = original artwork colours (default). `tinted` = palette + colour overlay (preserves luminance). `solid` = every pixel flattened to one colour.',
    },
    color: {
      control: 'color',
      description: 'Tint hue for `tinted`, flat colour for `solid`. Ignored for `palette`.',
    },
    size: {
      control: { type: 'number', min: 8, max: 256, step: 4 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PxlKitIcon>;

// ── Appearance modes ────────────────────────────────────────────────────

export const Palette: Story = {
  name: 'Palette (default)',
  args: {
    appearance: 'palette',
  },
};

export const TintedRed: Story = {
  name: 'Tinted — red',
  args: {
    appearance: 'tinted',
    color: '#FF4D4D',
  },
};

export const TintedCyan: Story = {
  name: 'Tinted — cyan',
  args: {
    appearance: 'tinted',
    color: '#24827A',
  },
};

export const TintedPurple: Story = {
  name: 'Tinted — purple',
  args: {
    appearance: 'tinted',
    color: '#8237C8',
  },
};

export const Solid: Story = {
  name: 'Solid — currentColor',
  args: {
    appearance: 'solid',
  },
};

export const SolidCustomColor: Story = {
  name: 'Solid — custom colour',
  args: {
    appearance: 'solid',
    color: '#00ff88',
  },
};

export const AppearanceSideBySide: Story = {
  name: 'Palette vs Tinted vs Solid',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} appearance="palette" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>appearance=&quot;palette&quot;</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} appearance="tinted" color="#FF4D4D" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tinted &amp; #FF4D4D</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} appearance="tinted" color="#24827A" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tinted &amp; #24827A</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} appearance="tinted" color="#8237C8" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tinted &amp; #8237C8</p>
      </div>
      <div style={{ textAlign: 'center', color: '#FF4D4D' }}>
        <PxlKitIcon icon={demoIcon} size={64} appearance="solid" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>solid (flat)</p>
      </div>
    </div>
  ),
};

// ── Sizes — verifies nearest-neighbour scaling across the GridSize union ──

export const Size16: Story = {
  name: 'Size 16px',
  args: { size: 16, appearance: 'palette' },
};
export const Size32: Story = {
  name: 'Size 32px',
  args: { size: 32, appearance: 'palette' },
};
export const Size48: Story = {
  name: 'Size 48px',
  args: { size: 48, appearance: 'palette' },
};
export const Size64: Story = {
  name: 'Size 64px',
  args: { size: 64, appearance: 'palette' },
};
export const Size128: Story = {
  name: 'Size 128px',
  args: { size: 128, appearance: 'palette' },
};

// ── Customisation slots ────────────────────────────────────────────────

export const WithClassName: Story = {
  args: {
    appearance: 'palette',
    className: 'opacity-50',
  },
};

export const WithAriaLabel: Story = {
  args: {
    appearance: 'palette',
    'aria-label': 'Golden trophy icon',
  },
};
