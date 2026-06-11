import { useState } from 'react';
import { PixelInput } from './PixelInput';

export function Default() {
  return (
    <PixelInput
      label="Username"
      placeholder="hero@pxlkit.xyz"
      hint="Your retro alias"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('');
  return (
    <PixelInput
      label="Email"
      type="email"
      placeholder="hero@pxlkit.xyz"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      tone="cyan"
    />
  );
}

export function Uncontrolled() {
  return (
    <PixelInput
      label="Display name"
      defaultValue="Pixel Hero"
      hint="Edit me — uncontrolled"
    />
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInput label="Neutral" tone="neutral" defaultValue="neutral" />
      <PixelInput label="Cyan" tone="cyan" defaultValue="cyan" />
      <PixelInput label="Green" tone="green" defaultValue="green" />
      <PixelInput label="Gold" tone="gold" defaultValue="gold" />
      <PixelInput label="Purple" tone="purple" defaultValue="purple" />
      <PixelInput label="Pink" tone="pink" defaultValue="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInput label="Small" size="sm" placeholder="sm" />
      <PixelInput label="Medium" size="md" placeholder="md" />
      <PixelInput label="Large" size="lg" placeholder="lg" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInput label="Pixel" surface="pixel" placeholder="pixel surface" />
      <PixelInput label="Linear" surface="linear" placeholder="linear surface" />
    </div>
  );
}

export function WithPrefixSuffix() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInput
        label="Amount"
        prefix={<span className="text-xs">$</span>}
        suffix={<span className="text-xs">USD</span>}
        defaultValue="42"
      />
      <PixelInput
        label="Search"
        prefix={<span aria-hidden>?</span>}
        placeholder="Find anything"
      />
    </div>
  );
}

export function WithAddons() {
  return (
    <PixelInput
      label="Website"
      addonLeft={<span className="text-xs">https://</span>}
      addonRight={<span className="text-xs">.xyz</span>}
      defaultValue="pxlkit"
    />
  );
}

export function Clearable() {
  const [value, setValue] = useState('clear me');
  return (
    <PixelInput
      label="Clearable"
      clearable
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
    />
  );
}

export function Loading() {
  return (
    <PixelInput
      label="Verifying handle"
      defaultValue="pxlhero"
      loading
    />
  );
}

export function Disabled() {
  return (
    <PixelInput
      label="Disabled"
      defaultValue="cannot edit"
      disabled
    />
  );
}

export function WithError() {
  return (
    <PixelInput
      label="Email"
      defaultValue="not-an-email"
      error="Please enter a valid email address"
      tone="red"
    />
  );
}

export function WithCharCount() {
  const [value, setValue] = useState('Hello');
  return (
    <PixelInput
      label="Bio"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      showCount={{ max: 80 }}
      hint="Keep it short"
    />
  );
}
