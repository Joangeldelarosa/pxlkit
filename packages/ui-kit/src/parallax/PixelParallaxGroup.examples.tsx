import React from 'react';
import { PixelParallaxGroup } from './PixelParallaxGroup';

export function Default() {
  return (
    <PixelParallaxGroup
      style={{ height: 240, background: '#0b0b0f', color: '#e5e7eb' }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        Parallax viewport
      </div>
    </PixelParallaxGroup>
  );
}

export function AsSection() {
  return (
    <PixelParallaxGroup
      as="section"
      style={{ height: 200, background: '#111827', color: '#e5e7eb' }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        Section variant
      </div>
    </PixelParallaxGroup>
  );
}
