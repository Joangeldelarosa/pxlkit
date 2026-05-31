import React from 'react';
import { PixelZoomIn } from './PixelZoomIn';

export function Default() {
  return (
    <PixelZoomIn>
      <div style={{ padding: 16, background: '#0EA5E9', color: '#fff', borderRadius: 8 }}>
        Zoom in content
      </div>
    </PixelZoomIn>
  );
}

export function CustomStartScale() {
  return (
    <PixelZoomIn startScale={0.6} duration={500}>
      <div style={{ padding: 16, background: '#A855F7', color: '#fff', borderRadius: 8 }}>
        Bigger zoom from 0.6
      </div>
    </PixelZoomIn>
  );
}

export function HoverTrigger() {
  return (
    <PixelZoomIn trigger="hover" repeat="infinite" duration={600}>
      <button style={{ padding: 12, background: '#111', color: '#fff', borderRadius: 6 }}>
        Hover me
      </button>
    </PixelZoomIn>
  );
}
