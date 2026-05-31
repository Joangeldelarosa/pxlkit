import React from 'react';
import { PixelPulse } from './PixelPulse';

export function Default() {
  return (
    <PixelPulse>
      <span>Pulse</span>
    </PixelPulse>
  );
}

export function FasterPulse() {
  return (
    <PixelPulse duration={1000}>
      <span>Quick Pulse</span>
    </PixelPulse>
  );
}

export function HoverTrigger() {
  return (
    <PixelPulse trigger="hover" repeat={1}>
      <span>Hover me</span>
    </PixelPulse>
  );
}
