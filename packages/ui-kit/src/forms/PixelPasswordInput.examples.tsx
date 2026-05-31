import { useState } from 'react';
import { PixelPasswordInput } from '../inputs';

export function Default() {
  return <PixelPasswordInput label="Password" placeholder="Enter password" />;
}

export function WithHint() {
  return (
    <PixelPasswordInput
      label="Password"
      hint="At least 8 characters, mixing letters and numbers."
      placeholder="Enter password"
    />
  );
}

export function WithError() {
  return (
    <PixelPasswordInput
      label="Password"
      error="Password is too short."
      defaultValue="abc"
    />
  );
}

export function Tones() {
  return (
    <div className="space-y-3">
      <PixelPasswordInput label="Neutral" tone="neutral" placeholder="Password" />
      <PixelPasswordInput label="Green" tone="green" placeholder="Password" />
      <PixelPasswordInput label="Cyan" tone="cyan" placeholder="Password" />
      <PixelPasswordInput label="Gold" tone="gold" placeholder="Password" />
      <PixelPasswordInput label="Red" tone="red" placeholder="Password" />
      <PixelPasswordInput label="Purple" tone="purple" placeholder="Password" />
      <PixelPasswordInput label="Pink" tone="pink" placeholder="Password" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="space-y-3">
      <PixelPasswordInput label="Small" size="sm" placeholder="Password" />
      <PixelPasswordInput label="Medium" size="md" placeholder="Password" />
      <PixelPasswordInput label="Large" size="lg" placeholder="Password" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="space-y-3">
      <PixelPasswordInput label="Pixel surface" surface="pixel" placeholder="Password" />
      <PixelPasswordInput label="Linear surface" surface="linear" placeholder="Password" />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelPasswordInput
      label="Password"
      disabled
      defaultValue="cannot-edit"
    />
  );
}

export function CustomToggleLabels() {
  return (
    <PixelPasswordInput
      label="Password"
      toggleLabels={['View', 'Mask']}
      placeholder="Enter password"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('');
  return (
    <PixelPasswordInput
      label="Password"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      hint={`Length: ${value.length}`}
    />
  );
}

export function Uncontrolled() {
  return (
    <PixelPasswordInput
      label="Password"
      defaultValue="hunter2"
    />
  );
}
