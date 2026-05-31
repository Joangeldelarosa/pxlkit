import React from 'react';
import { PixelCarousel } from './PixelCarousel';

function Slide({ label, tone }: { label: string; tone: string }) {
  return (
    <div
      className="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text"
      style={{ background: tone }}
    >
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function Default() {
  return (
    <PixelCarousel aria-label="Featured items">
      <PixelCarousel.Item>
        <Slide label="Slide 1" tone="rgba(14,165,233,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Slide 2" tone="rgba(168,85,247,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Slide 3" tone="rgba(34,197,94,0.15)" />
      </PixelCarousel.Item>
    </PixelCarousel>
  );
}

export function WithDots() {
  return (
    <PixelCarousel aria-label="Featured items with dots" showDots>
      <PixelCarousel.Item>
        <Slide label="One" tone="rgba(14,165,233,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Two" tone="rgba(168,85,247,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Three" tone="rgba(34,197,94,0.15)" />
      </PixelCarousel.Item>
    </PixelCarousel>
  );
}

export function Looping() {
  return (
    <PixelCarousel aria-label="Looping carousel" opts={{ loop: true }} showDots>
      <PixelCarousel.Item>
        <Slide label="Alpha" tone="rgba(14,165,233,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Beta" tone="rgba(168,85,247,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Gamma" tone="rgba(34,197,94,0.15)" />
      </PixelCarousel.Item>
    </PixelCarousel>
  );
}

export function Vertical() {
  return (
    <div style={{ height: 240 }}>
      <PixelCarousel aria-label="Vertical carousel" orientation="vertical" showDots>
        <PixelCarousel.Item>
          <Slide label="Top" tone="rgba(14,165,233,0.15)" />
        </PixelCarousel.Item>
        <PixelCarousel.Item>
          <Slide label="Middle" tone="rgba(168,85,247,0.15)" />
        </PixelCarousel.Item>
        <PixelCarousel.Item>
          <Slide label="Bottom" tone="rgba(34,197,94,0.15)" />
        </PixelCarousel.Item>
      </PixelCarousel>
    </div>
  );
}

export function LinearSurface() {
  return (
    <PixelCarousel aria-label="Linear surface carousel" surface="linear" showDots>
      <PixelCarousel.Item>
        <Slide label="Slide 1" tone="rgba(14,165,233,0.15)" />
      </PixelCarousel.Item>
      <PixelCarousel.Item>
        <Slide label="Slide 2" tone="rgba(168,85,247,0.15)" />
      </PixelCarousel.Item>
    </PixelCarousel>
  );
}
