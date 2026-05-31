import React from 'react';
import { PixelCenter } from './PixelCenter';

export function Default() {
  return (
    <PixelCenter>
      <p className="text-sm text-retro-muted">
        Centered content with the default max-width and page gutter.
      </p>
    </PixelCenter>
  );
}

export function NarrowProse() {
  return (
    <PixelCenter maxWidth="2xl" text="left">
      <p className="text-sm text-retro-muted">
        A narrower max-width is useful for long-form reading flows where measure matters.
      </p>
    </PixelCenter>
  );
}

export function TextCentered() {
  return (
    <PixelCenter maxWidth="3xl" text="center" gutter="md">
      <p className="text-sm text-retro-muted">
        Both the wrapper and the inner text are centered.
      </p>
    </PixelCenter>
  );
}

export function AsSection() {
  return (
    <PixelCenter as="section" maxWidth="4xl" gutter="lg" surface="pixel">
      <p className="text-sm text-retro-muted">
        Polymorphic: renders as a semantic &lt;section&gt; on the pixel surface.
      </p>
    </PixelCenter>
  );
}
