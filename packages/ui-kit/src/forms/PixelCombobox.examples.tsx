import { useState } from 'react';
import { PixelCombobox } from './PixelCombobox';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const GROUPED = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 've', label: 'Venezuela', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
];

export function Default() {
  return (
    <PixelCombobox
      label="Fruit"
      options={FRUITS}
      placeholder="Pick a fruit"
      hint="Type to filter"
    />
  );
}

export function Uncontrolled() {
  return (
    <PixelCombobox
      label="Fruit"
      options={FRUITS}
      defaultValue="banana"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('cherry');
  return (
    <PixelCombobox
      label="Controlled fruit"
      options={FRUITS}
      value={value}
      onChange={setValue}
    />
  );
}

export function Grouped() {
  return (
    <PixelCombobox
      label="Country"
      options={GROUPED}
      placeholder="Pick a country"
    />
  );
}

export function NotSearchable() {
  return (
    <PixelCombobox
      label="Fruit"
      options={FRUITS}
      searchable={false}
      placeholder="No filter"
    />
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelCombobox label="Small" options={FRUITS} size="sm" placeholder="sm" />
      <PixelCombobox label="Medium" options={FRUITS} size="md" placeholder="md" />
      <PixelCombobox label="Large" options={FRUITS} size="lg" placeholder="lg" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelCombobox label="Pixel" options={FRUITS} surface="pixel" placeholder="pixel surface" />
      <PixelCombobox label="Linear" options={FRUITS} surface="linear" placeholder="linear surface" />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelCombobox
      label="Disabled"
      options={FRUITS}
      defaultValue="apple"
      disabled
    />
  );
}

export function WithError() {
  return (
    <PixelCombobox
      label="Fruit"
      options={FRUITS}
      placeholder="Pick one"
      error="Please choose a fruit"
    />
  );
}

export function WithFormName() {
  return (
    <form>
      <PixelCombobox
        label="Fruit"
        options={FRUITS}
        name="fruit"
        defaultValue="cherry"
        hint="Value participates in native form submission"
      />
    </form>
  );
}

export function CustomEmptyMessage() {
  return (
    <PixelCombobox
      label="Fruit"
      options={FRUITS}
      placeholder="Type 'xyz'"
      emptyMessage="No fruits match your filter"
    />
  );
}
