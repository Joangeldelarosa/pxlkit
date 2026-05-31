import React from 'react';
import { PixelBento, PixelBentoCell } from './PixelBento';

export function Default() {
  return (
    <PixelBento columns={3} gap={4}>
      <PixelBentoCell span="2x2" kind="feature" tone="cyan">
        <strong>Feature</strong>
        <span>Spans 2x2 with a feature layout.</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="stat" tone="green">
        <strong>42</strong>
        <span>Stats</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="compact" tone="gold">
        <span>Compact</span>
      </PixelBentoCell>
      <PixelBentoCell span="2x1" kind="feature" tone="purple">
        <strong>Wide</strong>
        <span>Spans 2x1.</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="media" tone="neutral">
        <div className="h-full w-full bg-retro-surface" />
      </PixelBentoCell>
    </PixelBento>
  );
}

export function FourColumns() {
  return (
    <PixelBento columns={4} gap={3}>
      <PixelBentoCell span="2x2" kind="feature" tone="cyan">
        <strong>Hero</strong>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="stat" tone="green">
        <strong>12</strong>
        <span>Active</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="stat" tone="gold">
        <strong>87%</strong>
        <span>Uptime</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="compact" tone="red">
        <span>Alert</span>
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="compact" tone="purple">
        <span>Tag</span>
      </PixelBentoCell>
    </PixelBento>
  );
}

export function Cells() {
  return (
    <PixelBento columns={3} gap={4}>
      <PixelBentoCell span="1x1" kind="feature" tone="neutral">
        Neutral
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="feature" tone="cyan">
        Cyan
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="feature" tone="green">
        Green
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="feature" tone="gold">
        Gold
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="feature" tone="red">
        Red
      </PixelBentoCell>
      <PixelBentoCell span="1x1" kind="feature" tone="purple">
        Purple
      </PixelBentoCell>
    </PixelBento>
  );
}
