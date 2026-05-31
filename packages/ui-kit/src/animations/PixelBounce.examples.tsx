import React from 'react';
import { PixelBounce } from './PixelBounce';

export function Default() {
  return (
    <PixelBounce>
      <span>Bounce</span>
    </PixelBounce>
  );
}

export function TallerBounce() {
  return (
    <PixelBounce height={16} duration={1000}>
      <span>Higher Jump</span>
    </PixelBounce>
  );
}

export function HoverTrigger() {
  return (
    <PixelBounce trigger="hover" repeat={1}>
      <span>Hover me</span>
    </PixelBounce>
  );
}
