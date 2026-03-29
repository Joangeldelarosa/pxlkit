import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { PixelToast } from './PixelToast';
import type { PxlKitData } from '../types';

const demoIcon: PxlKitData = {
  name: 'bell-icon',
  size: 8,
  category: 'demo',
  grid: [
    '...BB...',
    '..BBB...',
    '.BBBBB..',
    '.BBBBB..',
    '.BBBBB..',
    'BBBBBBB.',
    '........',
    '..BBB...',
  ],
  palette: {
    B: '#FFD700',
  },
  tags: ['bell', 'notification'],
};

const meta: Meta<typeof PixelToast> = {
  title: 'Core/PixelToast',
  component: PixelToast,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    visible: true,
    title: 'SYSTEM MESSAGE',
    position: 'top-right',
    showClose: true,
    duration: 0,
  },
};

export default meta;
type Story = StoryObj<typeof PixelToast>;

export const Default: Story = {
  args: {
    title: 'SYSTEM MESSAGE',
  },
};

export const WithMessage: Story = {
  args: {
    title: 'QUEST COMPLETE',
    message: 'You have collected all the coins!',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'NEW NOTIFICATION',
    message: 'You have a new message.',
    icon: demoIcon,
    colorfulIcon: true,
    iconSize: 32,
  },
};

export const WithoutCloseButton: Story = {
  args: {
    title: 'AUTO DISMISS',
    message: 'This toast has no close button.',
    showClose: false,
  },
};

export const TopLeft: Story = {
  args: {
    title: 'TOP LEFT',
    position: 'top-left',
  },
};

export const TopRight: Story = {
  args: {
    title: 'TOP RIGHT',
    position: 'top-right',
  },
};

export const BottomLeft: Story = {
  args: {
    title: 'BOTTOM LEFT',
    position: 'bottom-left',
  },
};

export const BottomRight: Story = {
  args: {
    title: 'BOTTOM RIGHT',
    position: 'bottom-right',
  },
};

export const CustomColors: Story = {
  args: {
    title: 'CUSTOM THEME',
    message: 'A custom colored toast.',
    bgColor: '#1a0033',
    borderColor: '#8800ff',
    textColor: '#f0f0ff',
    accentColor: '#cc00ff',
  },
};

export const AutoDismiss: Story = {
  name: 'Auto-dismiss (3s)',
  render: (args) => {
    const [visible, setVisible] = useState(true);
    return (
      <div>
        {!visible && (
          <button
            onClick={() => setVisible(true)}
            style={{ color: '#00ff88', border: '1px solid #00ff88', padding: '8px 16px' }}
          >
            Show Toast
          </button>
        )}
        <PixelToast
          {...args}
          visible={visible}
          onClose={() => setVisible(false)}
        />
      </div>
    );
  },
  args: {
    title: 'AUTO DISMISS',
    message: 'This toast will dismiss in 3 seconds.',
    duration: 3000,
  },
};
