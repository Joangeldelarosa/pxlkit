import React from 'react';
import { PixelDivider } from '../layout';

export function Default() {
  return <PixelDivider />;
}

export function WithLabel() {
  return <PixelDivider label="Section" />;
}

export function Tones() {
  return (
    <div className="flex flex-col gap-4">
      <PixelDivider label="Neutral" tone="neutral" />
      <PixelDivider label="Green" tone="green" />
      <PixelDivider label="Cyan" tone="cyan" />
      <PixelDivider label="Gold" tone="gold" />
      <PixelDivider label="Red" tone="red" />
      <PixelDivider label="Purple" tone="purple" />
      <PixelDivider label="Pink" tone="pink" />
    </div>
  );
}

export function Spacings() {
  return (
    <div>
      <PixelDivider label="None" spacing="none" />
      <PixelDivider label="Small" spacing="sm" />
      <PixelDivider label="Medium" spacing="md" />
      <PixelDivider label="Large" spacing="lg" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-6">
      <PixelDivider label="Pixel surface" surface="pixel" />
      <PixelDivider label="Linear surface" surface="linear" />
    </div>
  );
}

export function PlainRule() {
  return (
    <div className="flex flex-col gap-6">
      <PixelDivider surface="pixel" />
      <PixelDivider surface="linear" />
    </div>
  );
}
