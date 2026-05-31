import React from 'react';
import { PixelButton } from '../actions';

export function Default() {
  return <PixelButton>Click me</PixelButton>;
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton tone="green">Green</PixelButton>
      <PixelButton tone="cyan">Cyan</PixelButton>
      <PixelButton tone="gold">Gold</PixelButton>
      <PixelButton tone="red">Red</PixelButton>
      <PixelButton tone="purple">Purple</PixelButton>
      <PixelButton tone="pink">Pink</PixelButton>
      <PixelButton tone="neutral">Neutral</PixelButton>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelButton size="sm">Small</PixelButton>
      <PixelButton size="md">Medium</PixelButton>
      <PixelButton size="lg">Large</PixelButton>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton variant="solid">Solid</PixelButton>
      <PixelButton variant="soft">Soft</PixelButton>
      <PixelButton variant="outline">Outline</PixelButton>
      <PixelButton variant="ghost">Ghost</PixelButton>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton surface="pixel">Pixel</PixelButton>
      <PixelButton surface="linear">Linear</PixelButton>
    </div>
  );
}

const Arrow = () => (
  <span aria-hidden className="inline-block h-3.5 w-3.5">→</span>
);

export function WithIcons() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton iconLeft={<Arrow />}>Leading</PixelButton>
      <PixelButton iconRight={<Arrow />}>Trailing</PixelButton>
      <PixelButton iconLeft={<Arrow />} iconRight={<Arrow />}>Both</PixelButton>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton loading>Saving</PixelButton>
      <PixelButton loading tone="cyan" variant="outline">Loading</PixelButton>
    </div>
  );
}

export function Disabled() {
  return (
    <div className="flex flex-wrap gap-2">
      <PixelButton disabled>Disabled</PixelButton>
      <PixelButton disabled variant="outline">Disabled outline</PixelButton>
    </div>
  );
}

export function FullWidth() {
  return (
    <div className="w-full max-w-sm">
      <PixelButton fullWidth>Full width</PixelButton>
    </div>
  );
}

export function AsChild() {
  return (
    <PixelButton asChild tone="cyan">
      <a href="https://pxlkit.dev" target="_blank" rel="noreferrer">
        External link
      </a>
    </PixelButton>
  );
}
