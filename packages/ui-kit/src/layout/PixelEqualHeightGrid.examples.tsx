import React from 'react';
import { cn } from '../common';
import { PixelEqualHeightGrid } from './PixelEqualHeightGrid';

// PixelEqualHeightGrid lays out the rows of each item through its
// className, so the card passes it on to its root.
function Card({ title, body, className }: { title: string; body: string; className?: string }) {
  return (
    <div className={cn('border border-retro-border p-4', className)}>
      <h3 className="text-sm font-semibold text-retro-text">{title}</h3>
      <p className="text-sm text-retro-muted">{body}</p>
      <div className="mt-2 text-xs text-retro-muted">Footer</div>
    </div>
  );
}

export function Default() {
  return (
    <PixelEqualHeightGrid cols={{ base: 1, sm: 3 }} gap={4}>
      <Card title="One" body="Short copy." />
      <Card title="Two" body="A longer body that forces the row to grow taller than the first card." />
      <Card title="Three" body="Medium length copy here." />
    </PixelEqualHeightGrid>
  );
}

export function RowAlignTop() {
  return (
    <PixelEqualHeightGrid cols={{ base: 1, sm: 3 }} gap={4} rowAlign="top">
      <Card title="One" body="Short copy." />
      <Card title="Two" body="A longer body that would otherwise stretch siblings." />
      <Card title="Three" body="Medium length copy here." />
    </PixelEqualHeightGrid>
  );
}

export function PixelSurface() {
  return (
    <PixelEqualHeightGrid cols={2} gap={4} surface="pixel">
      <Card title="Pixel A" body="Surface-aware grid item." />
      <Card title="Pixel B" body="Renders with the pixel surface tokens applied to the grid." />
    </PixelEqualHeightGrid>
  );
}
