import React from 'react';
import { PixelBarChart } from './PixelBarChart';

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
  return <PixelBarChart data={sample} />;
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelBarChart data={sample} tone="cyan" />
      <PixelBarChart data={sample} tone="green" />
      <PixelBarChart data={sample} tone="gold" />
      <PixelBarChart data={sample} tone="red" />
      <PixelBarChart data={sample} tone="purple" />
      <PixelBarChart data={sample} tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelBarChart data={sample} size="sm" tone="cyan" />
      <PixelBarChart data={sample} size="md" tone="cyan" />
      <PixelBarChart data={sample} size="lg" tone="cyan" />
    </div>
  );
}

export function Horizontal() {
  return <PixelBarChart data={sample} orientation="horizontal" tone="green" />;
}

export function WithValues() {
  return <PixelBarChart data={sample} tone="gold" showValues />;
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PixelBarChart data={sample} surface="pixel" tone="purple" />
      <PixelBarChart data={sample} surface="linear" tone="purple" />
    </div>
  );
}
