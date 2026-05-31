import React from 'react';
import { PixelStack } from './PixelStack';

export function Default() {
  return (
    <PixelStack gap={4}>
      <div className="text-sm text-retro-muted">First item</div>
      <div className="text-sm text-retro-muted">Second item</div>
      <div className="text-sm text-retro-muted">Third item</div>
    </PixelStack>
  );
}

export function Row() {
  return (
    <PixelStack direction="row" gap={3} align="center">
      <div className="text-sm text-retro-muted">Left</div>
      <div className="text-sm text-retro-muted">Center</div>
      <div className="text-sm text-retro-muted">Right</div>
    </PixelStack>
  );
}

export function SpaceBetween() {
  return (
    <PixelStack direction="row" justify="between" align="center">
      <div className="text-sm text-retro-muted">Start</div>
      <div className="text-sm text-retro-muted">End</div>
    </PixelStack>
  );
}

export function Wrapped() {
  return (
    <PixelStack direction="row" gap={2} wrap>
      <div className="text-sm text-retro-muted">Tag A</div>
      <div className="text-sm text-retro-muted">Tag B</div>
      <div className="text-sm text-retro-muted">Tag C</div>
      <div className="text-sm text-retro-muted">Tag D</div>
    </PixelStack>
  );
}

export function PixelSurface() {
  return (
    <PixelStack surface="pixel" gap={4}>
      <div className="text-sm text-retro-muted">Surface-aware item</div>
      <div className="text-sm text-retro-muted">Picks up pixel transition</div>
    </PixelStack>
  );
}
