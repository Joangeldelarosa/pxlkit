import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  PixelInput,
  PixelPasswordInput,
  PixelTextarea,
  PixelSelect,
  PixelCheckbox,
  PixelRadioGroup,
  PixelSwitch,
  PixelSlider,
  PixelSegmented,
} from './inputs';
import { PxlKitIcon } from '@pxlkit/core';
import { Search, Gear } from '@pxlkit/ui';
import { Mail } from '@pxlkit/feedback';

const TONES = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SURFACES = ['pixel', 'linear'] as const;

const PLANETS = [
  { value: 'earth', label: 'Earth' },
  { value: 'mars', label: 'Mars' },
  { value: 'venus', label: 'Venus' },
];

const meta: Meta = {
  title: 'UI Kit / Inputs',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

/* ──────────────────────────────────────────────────────────────────────────
   AllInputs — playground showing every input under one surface.
   ────────────────────────────────────────────────────────────────────────── */
function InputPlayground({ surface }: { surface: 'pixel' | 'linear' }) {
  const [name, setName] = useState('Pixel Hero');
  const [planet, setPlanet] = useState('mars');
  const [agreed, setAgreed] = useState(false);
  const [tier, setTier] = useState('community');
  const [notify, setNotify] = useState(true);
  const [vol, setVol] = useState(60);
  const [view, setView] = useState('grid');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
      <PixelInput label="Username" value={name} onChange={(e) => setName(e.target.value)} hint="Your retro alias" icon={<PxlKitIcon icon={Search} size={14} />} surface={surface} />
      <PixelInput label="Email" type="email" placeholder="hero@pxlkit.xyz" tone="cyan" icon={<PxlKitIcon icon={Mail} size={14} />} surface={surface} />
      <PixelPasswordInput label="Password" placeholder="••••••••" surface={surface} />
      <PixelTextarea label="Bio" placeholder="Tell us about your pixel adventures…" surface={surface} />
      <PixelSelect
        label="Home planet"
        options={PLANETS}
        value={planet}
        onChange={setPlanet}
        tone="purple"
        surface={surface}
      />
      <div className="space-y-3 self-start">
        <PixelCheckbox label="I agree to the retro terms" checked={agreed} onChange={setAgreed} surface={surface} />
        <PixelSwitch label="Email notifications" checked={notify} onChange={setNotify} tone="cyan" surface={surface} />
      </div>
      <PixelRadioGroup
        label="License tier"
        value={tier}
        onChange={setTier}
        surface={surface}
        options={[
          { value: 'community', label: 'Community' },
          { value: 'indie', label: 'Indie' },
          { value: 'team', label: 'Team' },
        ]}
      />
      <div className="space-y-3 self-start">
        <PixelSlider label="Volume" value={vol} onChange={setVol} min={0} max={100} tone="gold" showMinMax surface={surface} />
        <PixelSegmented
          label="View"
          value={view}
          onChange={setView}
          surface={surface}
          options={[
            { value: 'grid', label: 'Grid' },
            { value: 'list', label: 'List' },
            { value: 'kanban', label: 'Kanban' },
          ]}
        />
      </div>
    </div>
  );
}

export const AllInputs: Story = {
  render: (args: any) => <InputPlayground surface={args.surface as 'pixel' | 'linear'} />,
  argTypes: {
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { surface: 'pixel' as const },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelInput
   ────────────────────────────────────────────────────────────────────────── */
export const PixelInputStory: Story = {
  name: 'PixelInput',
  render: (args: any) => {
    const [v, setV] = useState(args.defaultValue as string || '');
    return <PixelInput {...args} value={v} onChange={(e) => setV(e.target.value)} />;
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Search icons',
    placeholder: 'Find a pixel icon…',
    hint: 'Try "trophy" or "flame"',
    tone: 'cyan',
    size: 'md',
    surface: 'pixel',
    disabled: false,
    defaultValue: '',
    icon: <PxlKitIcon icon={Search} size={14} />,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelPasswordInput
   ────────────────────────────────────────────────────────────────────────── */
export const PixelPasswordInputStory: Story = {
  name: 'PixelPasswordInput',
  render: (args: any) => <PixelPasswordInput {...args} />,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Master key',
    placeholder: 'Enter your sigil…',
    hint: 'Keep it secret. Keep it safe.',
    tone: 'purple',
    size: 'md',
    surface: 'pixel',
    disabled: false,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelTextarea
   ────────────────────────────────────────────────────────────────────────── */
export const PixelTextareaStory: Story = {
  name: 'PixelTextarea',
  render: (args: any) => <PixelTextarea {...args} />,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Quest log',
    placeholder: 'Describe your latest adventure…',
    hint: 'Markdown supported',
    tone: 'green',
    surface: 'pixel',
    disabled: false,
    rows: 4,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSelect
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSelectStory: Story = {
  name: 'PixelSelect',
  render: (args: any) => {
    const [v, setV] = useState((args.value as string) || 'mars');
    return <PixelSelect {...args} value={v} onChange={setV} />;
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Home planet',
    placeholder: 'Choose your planet…',
    tone: 'purple',
    size: 'md',
    surface: 'pixel',
    disabled: false,
    options: PLANETS,
    value: 'mars',
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelCheckbox
   ────────────────────────────────────────────────────────────────────────── */
export const PixelCheckboxStory: Story = {
  name: 'PixelCheckbox',
  render: (args: any) => {
    const [v, setV] = useState(args.checked as boolean ?? false);
    return <PixelCheckbox {...args} checked={v} onChange={setV} />;
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  args: {
    label: 'Enable animated icons',
    tone: 'green',
    surface: 'pixel',
    disabled: false,
    checked: false,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelRadioGroup
   ────────────────────────────────────────────────────────────────────────── */
export const PixelRadioGroupStory: Story = {
  name: 'PixelRadioGroup',
  render: (args: any) => {
    const [v, setV] = useState(args.value as string || 'indie');
    return <PixelRadioGroup {...args} value={v} onChange={setV} />;
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'License tier',
    tone: 'cyan',
    surface: 'pixel',
    disabled: false,
    value: 'indie',
    options: [
      { value: 'community', label: 'Community' },
      { value: 'indie', label: 'Indie' },
      { value: 'team', label: 'Team' },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSwitch
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSwitchStory: Story = {
  name: 'PixelSwitch',
  render: (args: any) => {
    const [v, setV] = useState(args.checked as boolean ?? false);
    return <PixelSwitch {...args} checked={v} onChange={setV} />;
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  args: {
    label: 'Email notifications',
    tone: 'cyan',
    surface: 'pixel',
    disabled: false,
    checked: true,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSlider
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSliderStory: Story = {
  name: 'PixelSlider',
  render: (args: any) => {
    const [v, setV] = useState(args.value as number ?? 60);
    return <div className="w-80"><PixelSlider {...args} value={v} onChange={setV} /></div>;
  },
  argTypes: {
    label: { control: 'text' },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    showMinMax: { control: 'boolean' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Volume',
    min: 0,
    max: 100,
    step: 1,
    showMinMax: true,
    tone: 'gold',
    surface: 'pixel',
    disabled: false,
    value: 60,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelSegmented
   ────────────────────────────────────────────────────────────────────────── */
export const PixelSegmentedStory: Story = {
  name: 'PixelSegmented',
  render: (args: any) => {
    const [v, setV] = useState(args.value as string || 'grid');
    return <PixelSegmented {...args} value={v} onChange={setV} />;
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: TONES },
    surface: { control: 'inline-radio', options: SURFACES },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Layout density',
    tone: 'green',
    surface: 'pixel',
    disabled: false,
    value: 'grid',
    options: [
      { value: 'grid', label: 'Grid' },
      { value: 'list', label: 'List' },
      { value: 'kanban', label: 'Kanban' },
    ],
  },
};
