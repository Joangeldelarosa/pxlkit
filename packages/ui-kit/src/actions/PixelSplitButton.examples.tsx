import React from 'react';
import { PixelSplitButton } from '../actions';

const exportOptions = [
  { value: 'png', label: 'Export as PNG' },
  { value: 'svg', label: 'Export as SVG' },
  { value: 'json', label: 'Export icon code' },
];

export function Default() {
  return (
    <PixelSplitButton
      label="Export"
      options={exportOptions}
      onPrimary={() => {}}
      onSelect={() => {}}
    />
  );
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-3">
      <PixelSplitButton label="Green" tone="green" options={exportOptions} />
      <PixelSplitButton label="Cyan" tone="cyan" options={exportOptions} />
      <PixelSplitButton label="Gold" tone="gold" options={exportOptions} />
      <PixelSplitButton label="Red" tone="red" options={exportOptions} />
      <PixelSplitButton label="Purple" tone="purple" options={exportOptions} />
      <PixelSplitButton label="Pink" tone="pink" options={exportOptions} />
      <PixelSplitButton label="Neutral" tone="neutral" options={exportOptions} />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap gap-3">
      <PixelSplitButton label="Pixel" surface="pixel" options={exportOptions} />
      <PixelSplitButton label="Linear" surface="linear" options={exportOptions} />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelSplitButton
      label="Export"
      options={exportOptions}
      disabled
    />
  );
}

export function WithCallbacks() {
  const [last, setLast] = React.useState<string>('—');
  return (
    <div className="flex flex-col items-start gap-2">
      <PixelSplitButton
        label="Save"
        tone="cyan"
        options={[
          { value: 'draft', label: 'Save as draft' },
          { value: 'template', label: 'Save as template' },
          { value: 'copy', label: 'Save a copy' },
        ]}
        onPrimary={() => setLast('primary')}
        onSelect={(v) => setLast(v)}
      />
      <span className="text-xs text-retro-muted">last action: {last}</span>
    </div>
  );
}
