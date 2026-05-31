import * as React from 'react';
import { PixelBareInput } from '../data-display';

export function Default() {
  return <PixelBareInput placeholder="Type something" />;
}

export function Uncontrolled() {
  return <PixelBareInput defaultValue="hello world" aria-label="uncontrolled-input" />;
}

export function Controlled() {
  const [value, setValue] = React.useState('');
  return (
    <PixelBareInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Controlled"
      aria-label="controlled-input"
    />
  );
}

export function Email() {
  return <PixelBareInput type="email" placeholder="you@example.com" autoComplete="email" />;
}

export function Password() {
  return <PixelBareInput type="password" placeholder="••••••••" autoComplete="current-password" />;
}

export function Number() {
  return <PixelBareInput type="number" min={0} max={100} step={1} defaultValue={42} />;
}

export function Disabled() {
  return <PixelBareInput defaultValue="not editable" disabled aria-label="disabled-input" />;
}

export function ReadOnly() {
  return <PixelBareInput defaultValue="read only" readOnly aria-label="readonly-input" />;
}

export function Required() {
  return <PixelBareInput required placeholder="required field" aria-label="required-input" />;
}

export function WithRef() {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <PixelBareInput
      ref={ref}
      placeholder="Focus me via ref"
      onFocus={() => {
        /* ref attached */
      }}
    />
  );
}
