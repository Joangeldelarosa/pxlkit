import React from 'react';
import { PixelRibbon } from './PixelRibbon';

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      {children}
    </div>
  );
}

export function Default() {
  return (
    <Container>
      <PixelRibbon>New</PixelRibbon>
    </Container>
  );
}

export function CornerTilted() {
  return (
    <Container>
      <PixelRibbon position="corner-tr" tone="red">
        Hot
      </PixelRibbon>
    </Container>
  );
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-6">
      <Container>
        <PixelRibbon tone="green">Free</PixelRibbon>
      </Container>
      <Container>
        <PixelRibbon tone="cyan">Beta</PixelRibbon>
      </Container>
      <Container>
        <PixelRibbon tone="purple">Pro</PixelRibbon>
      </Container>
    </div>
  );
}

export function PositionLeft() {
  return (
    <Container>
      <PixelRibbon position="top-left" offset="lg" tone="gold">
        Sale
      </PixelRibbon>
    </Container>
  );
}
