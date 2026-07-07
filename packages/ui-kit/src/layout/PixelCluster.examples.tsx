import React from 'react';
import { PixelCluster } from './PixelCluster';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-retro-border px-2 py-1 text-xs text-retro-text">
      {children}
    </span>
  );
}

export function Default() {
  return (
    <PixelCluster>
      <Chip>react</Chip>
      <Chip>typescript</Chip>
      <Chip>tailwind</Chip>
      <Chip>next</Chip>
      <Chip>vite</Chip>
    </PixelCluster>
  );
}

export function Justified() {
  return (
    <PixelCluster justify="between" gap={6}>
      <Chip>left</Chip>
      <Chip>middle</Chip>
      <Chip>right</Chip>
    </PixelCluster>
  );
}

export function PixelSurface() {
  return (
    <PixelCluster surface="pixel" gap={3}>
      <Chip>alpha</Chip>
      <Chip>beta</Chip>
      <Chip>gamma</Chip>
    </PixelCluster>
  );
}
