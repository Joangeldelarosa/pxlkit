import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PixelModal, PixelTooltip, PixelDropdown } from './overlay';
import { PixelButton } from './actions';
import { PxlKitIcon } from '@pxlkit/core';
import { Gear } from '@pxlkit/ui';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const meta: Meta = {
  title: 'UI Kit / Overlay',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

function ModalDemo({ surface, title }: { surface: 'pixel' | 'linear'; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PixelButton tone="cyan" surface={surface} onClick={() => setOpen(true)}>Open modal</PixelButton>
      <PixelModal open={open} title={title} surface={surface} onClose={() => setOpen(false)}>
        <p className="mb-3">Persisting the current procedural world seed will lock subsequent renders to this state.</p>
        <p className="text-retro-muted text-xs">You can revert later from the settings panel.</p>
      </PixelModal>
    </>
  );
}

/** Overview — every overlay component in one frame. */
export const AllOverlay: Story = {
  render: (args: any) => (
    <div className="space-y-8 max-w-2xl">
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelModal</h3>
        <ModalDemo surface={args.surface as 'pixel' | 'linear'} title="Save snapshot?" />
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelTooltip — 4 positions</h3>
        <div className="flex flex-wrap gap-6">
          <PixelTooltip content="Tooltip on top" surface={args.surface}><PixelButton surface={args.surface}>Top</PixelButton></PixelTooltip>
          <PixelTooltip content="Tooltip on bottom" position="bottom" surface={args.surface}><PixelButton tone="cyan" surface={args.surface}>Bottom</PixelButton></PixelTooltip>
          <PixelTooltip content="Tooltip on left" position="left" surface={args.surface}><PixelButton tone="purple" surface={args.surface}>Left</PixelButton></PixelTooltip>
          <PixelTooltip content="Tooltip on right" position="right" surface={args.surface}><PixelButton tone="gold" surface={args.surface}>Right</PixelButton></PixelTooltip>
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="font-pixel text-xs text-retro-green">PixelDropdown</h3>
        <PixelDropdown
          label="Actions"
          tone="green"
          surface={args.surface}
          icon={<PxlKitIcon icon={Gear} size={14} />}
          onSelect={(v) => console.log('dropdown selected', v)}
          items={[
            { value: 'duplicate', label: 'Duplicate' },
            { value: 'archive', label: 'Archive' },
            { value: 'export', label: 'Export as PNG' },
            { value: 'delete', label: 'Delete' },
          ]}
        />
      </section>
    </div>
  ),
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelModal
   ────────────────────────────────────────────────────────────────────────── */
export const PixelModalStory: Story = {
  name: 'PixelModal',
  render: (args: any) => <ModalDemo surface={args.surface as 'pixel' | 'linear'} title={args.title as string} />,
  argTypes: {
    title: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { title: 'Save snapshot?', size: 'md', surface: 'pixel' },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelTooltip
   ────────────────────────────────────────────────────────────────────────── */
export const PixelTooltipStory: Story = {
  name: 'PixelTooltip',
  render: (args: any) => (
    <PixelTooltip {...args}>
      <PixelButton surface={args.surface}>Hover me</PixelButton>
    </PixelTooltip>
  ),
  argTypes: {
    content: { control: 'text' },
    position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    content: 'Hovering tooltip',
    position: 'top',
    surface: 'pixel',
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelDropdown
   ────────────────────────────────────────────────────────────────────────── */
export const PixelDropdownStory: Story = {
  name: 'PixelDropdown',
  render: (args: any) => <PixelDropdown {...args} onSelect={(v) => console.log('selected', v)} />,
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Actions',
    tone: 'green',
    surface: 'pixel',
    disabled: false,
    items: [
      { value: 'duplicate', label: 'Duplicate' },
      { value: 'archive', label: 'Archive' },
      { value: 'export', label: 'Export as PNG' },
      { value: 'delete', label: 'Delete' },
    ],
  },
};
