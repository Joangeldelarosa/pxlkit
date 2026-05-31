import React from 'react';
import { PixelSparkline } from './PixelChartPrimitives';

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
  return <PixelSparkline data={sample} />;
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PixelSparkline data={sample} tone="cyan" />
      <PixelSparkline data={sample} tone="green" />
      <PixelSparkline data={sample} tone="gold" />
      <PixelSparkline data={sample} tone="red" />
      <PixelSparkline data={sample} tone="purple" />
      <PixelSparkline data={sample} tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PixelSparkline data={sample} size="sm" tone="cyan" />
      <PixelSparkline data={sample} size="md" tone="cyan" />
      <PixelSparkline data={sample} size="lg" tone="cyan" />
    </div>
  );
}

export function WithArea() {
  return <PixelSparkline data={sample} tone="green" showArea />;
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PixelSparkline data={sample} surface="pixel" tone="purple" />
      <PixelSparkline data={sample} surface="linear" tone="purple" />
    </div>
  );
}
