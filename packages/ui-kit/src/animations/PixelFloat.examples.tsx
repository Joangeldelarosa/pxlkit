import React from 'react';
import { PixelFloat } from './PixelFloat';

export function Default() {
  return (
    <PixelFloat>
      <span>Float</span>
    </PixelFloat>
  );
}

export function FartherTravel() {
  return (
    <PixelFloat distance={14} duration={2800}>
      <span>Drifting Higher</span>
    </PixelFloat>
  );
}

export function HoverTrigger() {
  return (
    <PixelFloat trigger="hover" repeat={3}>
      <span>Hover me</span>
    </PixelFloat>
  );
}
