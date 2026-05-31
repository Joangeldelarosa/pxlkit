import React from 'react';
import { PixelSection } from './PixelSection';

export function Default() {
  return (
    <PixelSection title="Overview" subtitle="Key metrics for this period.">
      <p className="text-sm text-retro-muted">
        Section content goes here. Wrap any layout block.
      </p>
    </PixelSection>
  );
}

export function WithoutTitle() {
  return (
    <PixelSection>
      <p className="text-sm text-retro-muted">A bare section without a title row.</p>
    </PixelSection>
  );
}

export function PixelSurface() {
  return (
    <PixelSection surface="pixel" title="Pixel Surface" subtitle="8-bit aesthetic.">
      <p className="text-sm text-retro-muted">Renders with the pixel surface tokens.</p>
    </PixelSection>
  );
}

export function NoContainer() {
  return (
    <PixelSection container={false} horizontalGutter="md" title="Full Width">
      <p className="text-sm text-retro-muted">No centered container; uses page gutters.</p>
    </PixelSection>
  );
}
