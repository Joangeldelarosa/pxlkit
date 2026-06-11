import React from 'react';
import { PixelBento } from './PixelBento';
import { PixelBentoCell } from './PixelBentoCell';

export function Default() {
  return (
    <PixelBento columns={3} gap={4}>
      <PixelBentoCell kind="feature" tone="neutral" span="2x1">
        <h3 className="text-sm font-semibold">Feature cell</h3>
        <p className="text-sm text-retro-muted">Span 2x1 with feature layout.</p>
      </PixelBentoCell>
      <PixelBentoCell kind="stat" tone="cyan" span="1x1">
        <span className="text-xs text-retro-muted">Active</span>
        <strong className="text-2xl">128</strong>
      </PixelBentoCell>
      <PixelBentoCell kind="compact" tone="green" span="1x1">
        <span className="text-sm">Compact</span>
      </PixelBentoCell>
    </PixelBento>
  );
}

export function Tones() {
  return (
    <PixelBento columns={3} gap={3}>
      <PixelBentoCell tone="purple" kind="stat">
        <span className="text-xs text-retro-muted">Purple</span>
        <strong className="text-2xl">42</strong>
      </PixelBentoCell>
      <PixelBentoCell tone="gold" kind="stat">
        <span className="text-xs text-retro-muted">Gold</span>
        <strong className="text-2xl">7</strong>
      </PixelBentoCell>
      <PixelBentoCell tone="red" kind="stat">
        <span className="text-xs text-retro-muted">Red</span>
        <strong className="text-2xl">3</strong>
      </PixelBentoCell>
    </PixelBento>
  );
}

export function MediaCell() {
  return (
    <PixelBento columns={3} gap={4}>
      <PixelBentoCell kind="media" tone="neutral" span="2x2">
        <div className="flex h-full min-h-[160px] items-center justify-center bg-retro-surface/40 text-sm text-retro-muted">
          Media slot
        </div>
      </PixelBentoCell>
      <PixelBentoCell kind="feature" tone="cyan" span="1x1">
        <h3 className="text-sm font-semibold">Caption</h3>
        <p className="text-sm text-retro-muted">Pairs with media.</p>
      </PixelBentoCell>
    </PixelBento>
  );
}
