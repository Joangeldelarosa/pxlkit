import React from 'react';
import { PixelRotate } from './PixelRotate';

export function Default() {
  return (
    <PixelRotate>
      <span>Rotate</span>
    </PixelRotate>
  );
}

export function ReverseDirection() {
  return (
    <PixelRotate direction="reverse" duration={2400}>
      <span>Reverse</span>
    </PixelRotate>
  );
}

export function HoverTrigger() {
  return (
    <PixelRotate trigger="hover" repeat={1} duration={900}>
      <span>Hover me</span>
    </PixelRotate>
  );
}
