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
  name: 'Colorful (Default)',
  args: {
    colorful: true,
  },
};

export const TintRed: Story = {
  name: 'Tint — red (preserves detail)',
  args: {
    colorful: true,
    tint: '#FF4D4D',
  },
};

export const TintCyan: Story = {
  name: 'Tint — cyan',
  args: {
    colorful: true,
    tint: '#24827A',
  },
};

export const TintPurple: Story = {
  name: 'Tint — purple',
  args: {
    colorful: true,
    tint: '#8237C8',
  },
};

export const SolidMonochrome: Story = {
  name: 'Solid — flattened to currentColor',
  args: {
    solid: true,
  },
};

export const SolidCustomColor: Story = {
  name: 'Solid — custom color (every pixel one colour)',
  args: {
    solid: true,
    color: '#00ff88',
  },
};

export const TintSideBySide: Story = {
  name: 'Tint vs Solid — side by side',
  render: (args) => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>colorful</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} tint="#FF4D4D" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tint="red"</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} tint="#24827A" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tint="cyan"</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <PxlKitIcon icon={demoIcon} size={64} tint="#8237C8" />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>tint="purple"</p>
      </div>
      <div style={{ textAlign: 'center', color: '#FF4D4D' }}>
        <PxlKitIcon icon={demoIcon} size={64} solid />
        <p style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>solid (flat — lost detail)</p>
      </div>
    </div>
  ),
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
