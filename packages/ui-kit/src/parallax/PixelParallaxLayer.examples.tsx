import React from 'react';
import { PixelParallaxLayer } from './PixelParallaxLayer';

export function Default() {
  return (
    <PixelParallaxLayer speed={0.5} axis="y">
      <div style={{ padding: 24, background: '#111', color: '#fff' }}>
        Scroll to see this layer move at half speed.
      </div>
    </PixelParallaxLayer>
  );
}

export function Foreground() {
  return (
    <PixelParallaxLayer speed={-0.3} axis="y">
      <div style={{ padding: 24, background: '#222', color: '#fff' }}>
        Foreground float-up (negative speed).
      </div>
    </PixelParallaxLayer>
  );
}

export function Horizontal() {
  return (
    <PixelParallaxLayer speed={0.4} axis="x">
      <div style={{ padding: 24, background: '#0EA5E9', color: '#fff' }}>
        Horizontal parallax drift.
      </div>
    </PixelParallaxLayer>
  );
}
