import React from 'react';
import { PixelMultiSelect } from './PixelMultiSelect';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular', disabled: true },
];

export function Default() {
  const [value, setValue] = React.useState<string[]>(['react']);
  return (
    <PixelMultiSelect
      label="Frameworks"
      options={OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Pick frameworks…"
    />
  );
}

export function Searchable() {
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <PixelMultiSelect
      label="Frameworks"
      hint="Type to filter"
      options={OPTIONS}
      value={value}
      onChange={setValue}
      searchable
      clearable
    />
  );
}

export function WithMax() {
  const [value, setValue] = React.useState<string[]>(['react', 'vue']);
  return (
    <PixelMultiSelect
      label="Pick up to 2"
      options={OPTIONS}
      value={value}
      onChange={setValue}
      max={2}
      clearable
    />
  );
}
