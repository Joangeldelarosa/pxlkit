import React from 'react';
import { PixelContainer } from './PixelContainer';

export function Default() {
  return (
    <PixelContainer>
      <p className="text-sm text-retro-muted">Default container — section landmark, xl max-width, lg rhythm.</p>
    </PixelContainer>
  );
}

export function Narrow() {
  return (
    <PixelContainer maxWidth="md" padding="md">
      <p className="text-sm text-retro-muted">Narrow container with md rhythm.</p>
    </PixelContainer>
  );
}

export function AsMain() {
  return (
    <PixelContainer as="main" aria-label="Page content" maxWidth="2xl" padding={{ x: 'lg', y: 'xl' }}>
      <p className="text-sm text-retro-muted">Rendered as the main landmark with split padding.</p>
    </PixelContainer>
  );
}

export function ProseWidth() {
  return (
    <PixelContainer maxWidth="prose" padding="sm">
      <p className="text-sm text-retro-muted">Prose-width container ideal for long-form reading.</p>
    </PixelContainer>
  );
}
