import React, { useState } from 'react';
import { PixelChipGroup } from './PixelChipGroup';
import { PixelChip } from './PixelChip';

// PixelChipGroup reads `value` off each child via children inspection; the chip
// component itself forwards unknown attrs, so we use a tiny shim here so the
// example reads naturally without leaking a `value` prop into PixelChipProps.
const Chip = PixelChip as unknown as React.ComponentType<
  React.ComponentProps<typeof PixelChip> & { value: string }
>;

export function Default() {
  const [value, setValue] = useState<string[]>(['react']);
  return (
    <PixelChipGroup value={value} onChange={setValue} aria-label="Frameworks">
      <Chip value="react" label="React" tone="cyan" />
      <Chip value="vue" label="Vue" tone="green" />
      <Chip value="svelte" label="Svelte" tone="gold" />
    </PixelChipGroup>
  );
}

export function MultiSelect() {
  const [value, setValue] = useState<string[]>(['ts', 'rust']);
  return (
    <PixelChipGroup
      value={value}
      onChange={setValue}
      multiple
      aria-label="Languages"
    >
      <Chip value="ts" label="TypeScript" tone="cyan" />
      <Chip value="rust" label="Rust" tone="gold" />
      <Chip value="go" label="Go" tone="green" />
      <Chip value="py" label="Python" tone="purple" />
    </PixelChipGroup>
  );
}

export function Surfaces() {
  const [a, setA] = useState<string[]>(['one']);
  const [b, setB] = useState<string[]>(['one']);
  return (
    <div className="flex flex-col gap-3">
      <PixelChipGroup value={a} onChange={setA} surface="pixel" aria-label="Pixel surface">
        <Chip value="one" label="One" tone="green" />
        <Chip value="two" label="Two" tone="green" />
      </PixelChipGroup>
      <PixelChipGroup value={b} onChange={setB} surface="linear" aria-label="Linear surface">
        <Chip value="one" label="One" tone="cyan" />
        <Chip value="two" label="Two" tone="cyan" />
      </PixelChipGroup>
    </div>
  );
}
