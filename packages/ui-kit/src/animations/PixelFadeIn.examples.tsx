import React from 'react';
import { PixelFadeIn } from './PixelFadeIn';

export function Default() {
  return (
    <PixelFadeIn>
      <div style={{ padding: 16, background: '#111', color: '#fff' }}>
        Fades in on mount
      </div>
    </PixelFadeIn>
  );
}

export function Delayed() {
  return (
    <PixelFadeIn duration={600} delay={200} easing="ease-out">
      <div style={{ padding: 16, background: '#0EA5E9', color: '#000' }}>
        Delayed fade-in
      </div>
    </PixelFadeIn>
  );
}

export function OnHover() {
  return (
    <PixelFadeIn trigger="hover" duration={300}>
      <div style={{ padding: 16, background: '#222', color: '#0EA5E9' }}>
        Hover to fade in
      </div>
    </PixelFadeIn>
  );
}
