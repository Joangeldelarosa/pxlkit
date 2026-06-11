import React from 'react';
import { PixelAreaChart } from './PixelAreaChart';

const sample = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
  { x: 'Wed', y: 9 },
  { x: 'Thu', y: 24 },
  { x: 'Fri', y: 16 },
  { x: 'Sat', y: 21 },
  { x: 'Sun', y: 14 },
];

export function Default() {
  return <PixelAreaChart data={sample} />;
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelAreaChart data={sample} tone="cyan" />
      <PixelAreaChart data={sample} tone="green" />
      <PixelAreaChart data={sample} tone="gold" />
      <PixelAreaChart data={sample} tone="red" />
      <PixelAreaChart data={sample} tone="purple" />
      <PixelAreaChart data={sample} tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelAreaChart data={sample} size="sm" tone="cyan" />
      <PixelAreaChart data={sample} size="md" tone="cyan" />
      <PixelAreaChart data={sample} size="lg" tone="cyan" />
    </div>
  );
}

export function Smooth() {
  return <PixelAreaChart data={sample} smooth tone="green" />;
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelAreaChart data={sample} surface="pixel" tone="purple" />
      <PixelAreaChart data={sample} surface="linear" tone="purple" />
    </div>
  );
}
