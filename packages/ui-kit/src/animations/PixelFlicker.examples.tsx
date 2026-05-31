import React from 'react';
import { PixelFlicker } from './PixelFlicker';

export function Default() {
  return (
    <PixelFlicker>
      <span>OPEN 24/7</span>
    </PixelFlicker>
  );
}

export function FasterFlicker() {
  return (
    <PixelFlicker duration={900}>
      <span>NEON</span>
    </PixelFlicker>
  );
}

export function HoverTrigger() {
  return (
    <PixelFlicker trigger="hover" repeat={1}>
      <span>Hover me</span>
    </PixelFlicker>
  );
}
