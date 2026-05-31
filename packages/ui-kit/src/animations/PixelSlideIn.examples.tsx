import React from 'react';
import { PixelSlideIn } from './PixelSlideIn';

export function Default() {
  return (
    <PixelSlideIn>
      <div style={{ padding: 16, background: '#111', color: '#fff' }}>
        Slides in from below on mount
      </div>
    </PixelSlideIn>
  );
}

export function FromLeft() {
  return (
    <PixelSlideIn from="left" duration={500} distance={20}>
      <div style={{ padding: 16, background: '#0EA5E9', color: '#000' }}>
        Slides in from the left
      </div>
    </PixelSlideIn>
  );
}

export function OnHover() {
  return (
    <PixelSlideIn trigger="hover" from="right" duration={300}>
      <div style={{ padding: 16, background: '#222', color: '#0EA5E9' }}>
        Hover to slide in from the right
      </div>
    </PixelSlideIn>
  );
}
