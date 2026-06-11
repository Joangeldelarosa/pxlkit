import React from 'react';
import { PixelStatGroup } from './PixelStatGroup';
import { PixelStatCard } from '../cards/PixelStatCard';

export function Default() {
  return (
    <PixelStatGroup aria-label="Key metrics">
      <PixelStatCard label="Users" value="1,284" />
      <PixelStatCard label="Revenue" value="$12.4k" />
      <PixelStatCard label="Active" value="312" />
    </PixelStatGroup>
  );
}

export function RowLayout() {
  return (
    <PixelStatGroup layout="row" aria-label="Row metrics">
      <PixelStatCard label="Sessions" value="842" />
      <PixelStatCard label="Conversions" value="56" />
      <PixelStatCard label="Bounce" value="24%" />
    </PixelStatGroup>
  );
}

export function GridLayout() {
  return (
    <PixelStatGroup layout="grid" columns={4} aria-label="Grid metrics">
      <PixelStatCard label="A" value="10" />
      <PixelStatCard label="B" value="20" />
      <PixelStatCard label="C" value="30" />
      <PixelStatCard label="D" value="40" />
    </PixelStatGroup>
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelStatGroup tone="cyan" aria-label="Cyan group">
        <PixelStatCard label="Cyan" value="1" tone="cyan" />
        <PixelStatCard label="Cyan" value="2" tone="cyan" />
      </PixelStatGroup>
      <PixelStatGroup tone="green" aria-label="Green group">
        <PixelStatCard label="Green" value="1" tone="green" />
        <PixelStatCard label="Green" value="2" tone="green" />
      </PixelStatGroup>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelStatGroup surface="pixel" aria-label="Pixel surface">
        <PixelStatCard label="Pixel" value="42" />
        <PixelStatCard label="Pixel" value="84" />
      </PixelStatGroup>
      <PixelStatGroup surface="linear" aria-label="Linear surface">
        <PixelStatCard label="Linear" value="42" />
        <PixelStatCard label="Linear" value="84" />
      </PixelStatGroup>
    </div>
  );
}
