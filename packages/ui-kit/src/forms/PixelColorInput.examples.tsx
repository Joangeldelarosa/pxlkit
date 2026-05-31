import React, { useState } from 'react';
import { PixelColorInput } from './PixelColorInput';

export function Default() {
  const [value, setValue] = useState<string>('#06b6d4');
  return (
    <PixelColorInput
      label="Brand color"
      value={value}
      onChange={setValue}
    />
  );
}

export function RgbFormat() {
  const [value, setValue] = useState<string>('rgb(34, 197, 94)');
  return (
    <PixelColorInput
      label="Accent color"
      format="rgb"
      value={value}
      onChange={setValue}
      hint="Stored as rgb()"
    />
  );
}

export function CustomPresets() {
  const [value, setValue] = useState<string>('#ef4444');
  return (
    <PixelColorInput
      label="Theme tone"
      presets={['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#a855f7']}
      value={value}
      onChange={setValue}
    />
  );
}

export function WithError() {
  return (
    <PixelColorInput
      label="Background"
      defaultValue="not-a-color"
      error="Invalid color value"
    />
  );
}
