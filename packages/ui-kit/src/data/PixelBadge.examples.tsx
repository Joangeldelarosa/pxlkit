import React from 'react';
import { PixelBadge } from './PixelBadge';

export function Default() {
  return <PixelBadge>NEW</PixelBadge>;
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelBadge tone="neutral">neutral</PixelBadge>
      <PixelBadge tone="green">green</PixelBadge>
      <PixelBadge tone="cyan">cyan</PixelBadge>
      <PixelBadge tone="gold">gold</PixelBadge>
      <PixelBadge tone="red">red</PixelBadge>
      <PixelBadge tone="purple">purple</PixelBadge>
      <PixelBadge tone="pink">pink</PixelBadge>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelBadge size="sm" tone="cyan">small</PixelBadge>
      <PixelBadge size="md" tone="cyan">medium</PixelBadge>
      <PixelBadge size="lg" tone="cyan">large</PixelBadge>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelBadge variant="soft" tone="green">soft</PixelBadge>
      <PixelBadge variant="solid" tone="green">solid</PixelBadge>
      <PixelBadge variant="outline" tone="green">outline</PixelBadge>
      <PixelBadge variant="ghost" tone="green">ghost</PixelBadge>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PixelBadge surface="pixel" tone="gold">pixel</PixelBadge>
      <PixelBadge surface="linear" tone="gold">linear</PixelBadge>
    </div>
  );
}

const DotIcon = () => (
  <span
    aria-hidden
    style={{ width: 6, height: 6, borderRadius: 9999, background: 'currentColor', display: 'inline-block' }}
  />
);

export function WithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelBadge tone="green" iconLeft={<DotIcon />}>online</PixelBadge>
      <PixelBadge tone="red" iconLeft={<DotIcon />}>error</PixelBadge>
      <PixelBadge tone="gold" iconLeft={<DotIcon />}>warn</PixelBadge>
    </div>
  );
}

export function Clickable() {
  return (
    <PixelBadge tone="cyan" variant="outline" onClick={() => undefined}>
      click me
    </PixelBadge>
  );
}
