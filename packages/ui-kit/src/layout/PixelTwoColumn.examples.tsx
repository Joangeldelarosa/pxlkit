import React from 'react';
import { PixelTwoColumn } from './PixelTwoColumn';

export function Default() {
  return (
    <PixelTwoColumn
      left={<div className="text-sm text-retro-muted">Left column</div>}
      right={<div className="text-sm text-retro-muted">Right column</div>}
    />
  );
}

export function SixtyForty() {
  return (
    <PixelTwoColumn
      ratio="60/40"
      gap={6}
      left={<div className="text-sm text-retro-muted">Main content (60%)</div>}
      right={<div className="text-sm text-retro-muted">Sidebar (40%)</div>}
    />
  );
}

export function Reversed() {
  return (
    <PixelTwoColumn
      ratio="70/30"
      reverse
      left={<div className="text-sm text-retro-muted">Logical left</div>}
      right={<div className="text-sm text-retro-muted">Visually first</div>}
    />
  );
}

export function StackedBelowLg() {
  return (
    <PixelTwoColumn
      stackBelow="lg"
      align="center"
      left={<div className="text-sm text-retro-muted">Stacks below lg</div>}
      right={<div className="text-sm text-retro-muted">Side-by-side at lg+</div>}
    />
  );
}

export function PixelSurface() {
  return (
    <PixelTwoColumn
      surface="pixel"
      ratio="50/50"
      left={<div className="text-sm text-retro-muted">Surface-aware left</div>}
      right={<div className="text-sm text-retro-muted">Surface-aware right</div>}
    />
  );
}
