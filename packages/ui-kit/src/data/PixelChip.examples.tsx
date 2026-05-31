import { useState } from 'react';
import { PixelChip } from '../data-display';

export function Default() {
  return <PixelChip label="React" />;
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelChip label="Neutral" tone="neutral" />
      <PixelChip label="Green" tone="green" />
      <PixelChip label="Cyan" tone="cyan" />
      <PixelChip label="Gold" tone="gold" />
      <PixelChip label="Red" tone="red" />
      <PixelChip label="Purple" tone="purple" />
      <PixelChip label="Pink" tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelChip label="Small" size="sm" />
      <PixelChip label="Medium" size="md" />
      <PixelChip label="Large" size="lg" />
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelChip label="Soft" variant="soft" tone="cyan" />
      <PixelChip label="Solid" variant="solid" tone="cyan" />
      <PixelChip label="Outline" variant="outline" tone="cyan" />
      <PixelChip label="Ghost" variant="ghost" tone="cyan" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelChip label="Pixel" surface="pixel" tone="green" />
      <PixelChip label="Linear" surface="linear" tone="green" />
    </div>
  );
}

export function WithIcon() {
  return (
    <PixelChip
      label="TypeScript"
      tone="cyan"
      iconLeft={<span aria-hidden>TS</span>}
    />
  );
}

export function Clickable() {
  return (
    <PixelChip
      label="Click me"
      tone="gold"
      onClick={() => {
        /* noop */
      }}
    />
  );
}

export function Deletable() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <PixelChip
      label="Remove me"
      tone="red"
      onDelete={() => setVisible(false)}
    />
  );
}

export function ClickableAndDeletable() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <PixelChip
      label="Tag"
      tone="purple"
      onClick={() => {
        /* select */
      }}
      onDelete={() => setVisible(false)}
    />
  );
}
