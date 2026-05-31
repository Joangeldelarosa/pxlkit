import React, { useState } from 'react';
import { PixelChipGroup } from './PixelBadgeGroup';
import { PixelChip } from '../data-display';

export function Default() {
  const [value, setValue] = useState<string[]>(['react']);
  return (
    <PixelChipGroup value={value} onChange={setValue} aria-label="Frameworks">
      <PixelChip value="react" label="React" tone="cyan" />
      <PixelChip value="vue" label="Vue" tone="green" />
      <PixelChip value="svelte" label="Svelte" tone="gold" />
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
      <PixelChip value="ts" label="TypeScript" tone="cyan" />
      <PixelChip value="rust" label="Rust" tone="gold" />
      <PixelChip value="go" label="Go" tone="green" />
      <PixelChip value="py" label="Python" tone="purple" />
    </PixelChipGroup>
  );
}

export function Surfaces() {
  const [a, setA] = useState<string[]>(['one']);
  const [b, setB] = useState<string[]>(['one']);
  return (
    <div className="flex flex-col gap-3">
      <PixelChipGroup value={a} onChange={setA} surface="pixel" aria-label="Pixel surface">
        <PixelChip value="one" label="One" tone="green" />
        <PixelChip value="two" label="Two" tone="green" />
      </PixelChipGroup>
      <PixelChipGroup value={b} onChange={setB} surface="linear" aria-label="Linear surface">
        <PixelChip value="one" label="One" tone="cyan" />
        <PixelChip value="two" label="Two" tone="cyan" />
      </PixelChipGroup>
    </div>
  );
}
