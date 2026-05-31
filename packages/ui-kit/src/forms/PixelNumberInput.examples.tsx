import React, { useState } from 'react';
import { PixelNumberInput } from './PixelNumberInput';

export function Default() {
  const [value, setValue] = useState<number>(5);
  return (
    <PixelNumberInput
      label="Quantity"
      value={value}
      onChange={setValue}
      min={0}
      max={100}
    />
  );
}

export function WithPrefixSuffix() {
  const [value, setValue] = useState<number>(19.99);
  return (
    <PixelNumberInput
      label="Price"
      value={value}
      onChange={setValue}
      prefix="$"
      suffix="USD"
      precision={2}
      step={0.01}
      min={0}
    />
  );
}

export function ThousandsSeparator() {
  const [value, setValue] = useState<number>(1500000);
  return (
    <PixelNumberInput
      label="Population"
      value={value}
      onChange={setValue}
      thousandsSeparator=","
      min={0}
    />
  );
}

export function HideControls() {
  const [value, setValue] = useState<number>(42);
  return (
    <PixelNumberInput
      label="Age"
      value={value}
      onChange={setValue}
      hideControls
      min={0}
      max={120}
    />
  );
}

export function WithError() {
  const [value, setValue] = useState<number>(150);
  return (
    <PixelNumberInput
      label="Score"
      value={value}
      onChange={setValue}
      min={0}
      max={100}
      error="Score must be between 0 and 100"
      tone="red"
    />
  );
}
