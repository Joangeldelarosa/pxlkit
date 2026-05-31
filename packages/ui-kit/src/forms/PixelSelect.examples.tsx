import { useState } from 'react';
import { PixelSelect } from '../inputs';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

const REGIONS = [
  { value: 'us', label: 'United States' },
  { value: 've', label: 'Venezuela' },
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
];

export function Default() {
  return (
    <PixelSelect
      label="Fruit"
      options={FRUITS}
      placeholder="Pick a fruit"
      hint="Choose your favorite"
    />
  );
}

export function Uncontrolled() {
  return (
    <PixelSelect
      label="Region"
      options={REGIONS}
      defaultValue="ve"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('banana');
  return (
    <PixelSelect
      label="Controlled fruit"
      options={FRUITS}
      value={value}
      onChange={setValue}
      tone="cyan"
    />
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelSelect label="Neutral" options={FRUITS} tone="neutral" defaultValue="apple" />
      <PixelSelect label="Cyan" options={FRUITS} tone="cyan" defaultValue="apple" />
      <PixelSelect label="Green" options={FRUITS} tone="green" defaultValue="apple" />
      <PixelSelect label="Gold" options={FRUITS} tone="gold" defaultValue="apple" />
      <PixelSelect label="Purple" options={FRUITS} tone="purple" defaultValue="apple" />
      <PixelSelect label="Pink" options={FRUITS} tone="pink" defaultValue="apple" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelSelect label="Small" options={FRUITS} size="sm" placeholder="sm" />
      <PixelSelect label="Medium" options={FRUITS} size="md" placeholder="md" />
      <PixelSelect label="Large" options={FRUITS} size="lg" placeholder="lg" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelSelect label="Pixel" options={FRUITS} surface="pixel" placeholder="pixel surface" />
      <PixelSelect label="Linear" options={FRUITS} surface="linear" placeholder="linear surface" />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelSelect
      label="Disabled"
      options={FRUITS}
      defaultValue="apple"
      disabled
    />
  );
}

export function WithError() {
  return (
    <PixelSelect
      label="Region"
      options={REGIONS}
      placeholder="Pick one"
      error="Please choose a region"
      tone="red"
    />
  );
}

export function Required() {
  return (
    <PixelSelect
      label="Region"
      options={REGIONS}
      name="region"
      required
      placeholder="Required field"
    />
  );
}

export function WithFormName() {
  return (
    <form>
      <PixelSelect
        label="Fruit"
        options={FRUITS}
        name="fruit"
        defaultValue="cherry"
        hint="Value participates in native form submission"
      />
    </form>
  );
}
