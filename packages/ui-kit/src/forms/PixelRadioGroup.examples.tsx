import { useState } from 'react';
import { PixelRadioGroup } from './PixelRadioGroup';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

export function Default() {
  const [value, setValue] = useState('free');
  return (
    <PixelRadioGroup
      label="Plan"
      value={value}
      options={PLANS}
      onChange={setValue}
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('pro');
  return (
    <div className="space-y-2">
      <PixelRadioGroup
        label="Selected plan"
        value={value}
        options={PLANS}
        onChange={setValue}
        tone="cyan"
      />
      <p className="text-xs text-retro-muted">Picked: {value}</p>
    </div>
  );
}

export function Tones() {
  const [value, setValue] = useState('pro');
  return (
    <div className="grid grid-cols-2 gap-6">
      <PixelRadioGroup label="Neutral" tone="neutral" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Green" tone="green" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Cyan" tone="cyan" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Gold" tone="gold" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Red" tone="red" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Purple" tone="purple" value={value} options={PLANS} onChange={setValue} />
      <PixelRadioGroup label="Pink" tone="pink" value={value} options={PLANS} onChange={setValue} />
    </div>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState('pro');
  const [linear, setLinear] = useState('pro');
  return (
    <div className="grid grid-cols-2 gap-6">
      <PixelRadioGroup
        label="Pixel surface"
        surface="pixel"
        value={pixel}
        options={PLANS}
        onChange={setPixel}
      />
      <PixelRadioGroup
        label="Linear surface"
        surface="linear"
        value={linear}
        options={PLANS}
        onChange={setLinear}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelRadioGroup
      label="Plan (locked)"
      value="pro"
      options={PLANS}
      onChange={() => {}}
      disabled
    />
  );
}

export function Required() {
  const [value, setValue] = useState('');
  return (
    <PixelRadioGroup
      label="Pick a plan to continue"
      value={value}
      options={PLANS}
      onChange={setValue}
      required
    />
  );
}

export function WithFormName() {
  const [value, setValue] = useState('pro');
  return (
    <form>
      <PixelRadioGroup
        label="Plan"
        name="plan"
        value={value}
        options={PLANS}
        onChange={setValue}
        required
      />
    </form>
  );
}
