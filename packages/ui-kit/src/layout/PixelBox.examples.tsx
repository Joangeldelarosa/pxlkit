import React from 'react';
import { PixelBox } from './PixelBox';

export function Default() {
  return (
    <PixelBox tone="neutral" variant="solid" padding="md">
      <p className="text-sm text-retro-muted">Surface-aware container box.</p>
    </PixelBox>
  );
}

export function Outline() {
  return (
    <PixelBox tone="cyan" variant="outline" padding="lg">
      <p className="text-sm text-retro-muted">Outline variant with implicit border.</p>
    </PixelBox>
  );
}

export function Soft() {
  return (
    <PixelBox tone="purple" variant="soft" padding="md" radius="md">
      <p className="text-sm text-retro-muted">Soft tonal background.</p>
    </PixelBox>
  );
}

export function AsSection() {
  return (
    <PixelBox as="section" aria-label="Stats" tone="green" variant="soft" padding="md" shadow>
      <p className="text-sm text-retro-muted">Rendered as a semantic section landmark.</p>
    </PixelBox>
  );
}
