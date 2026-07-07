import React from 'react';
import { PixelGrid } from './PixelGrid';

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {children}
    </div>
  );
}

export function Default() {
  return (
    <PixelGrid cols={3} gap={4}>
      <Cell>One</Cell>
      <Cell>Two</Cell>
      <Cell>Three</Cell>
      <Cell>Four</Cell>
      <Cell>Five</Cell>
      <Cell>Six</Cell>
    </PixelGrid>
  );
}

export function Responsive() {
  return (
    <PixelGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
      <Cell>4</Cell>
    </PixelGrid>
  );
}

export function AutoFit() {
  return (
    <PixelGrid autoFit minColWidth="12rem" gap={4}>
      <Cell>Auto A</Cell>
      <Cell>Auto B</Cell>
      <Cell>Auto C</Cell>
      <Cell>Auto D</Cell>
    </PixelGrid>
  );
}

export function AsymmetricGaps() {
  return (
    <PixelGrid cols={2} colGap={8} rowGap={2}>
      <Cell>A</Cell>
      <Cell>B</Cell>
      <Cell>C</Cell>
      <Cell>D</Cell>
    </PixelGrid>
  );
}
