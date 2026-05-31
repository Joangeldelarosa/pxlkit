import React from 'react';
import { PixelShake } from './PixelShake';

export function Default() {
  return (
    <PixelShake>
      <span>Shake on mount</span>
    </PixelShake>
  );
}

export function OnHover() {
  return (
    <PixelShake trigger="hover" repeat="infinite" duration={300}>
      <span>Hover to shake</span>
    </PixelShake>
  );
}

export function StrongShake() {
  return (
    <PixelShake distance={6} duration={600} repeat={3}>
      <span>Stronger shake</span>
    </PixelShake>
  );
}
