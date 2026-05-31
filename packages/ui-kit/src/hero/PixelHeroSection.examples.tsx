import React from 'react'
import { PixelHeroSection } from './PixelHeroSection'

export function Default() {
  return (
    <PixelHeroSection
      eyebrow="Introducing"
      headline="Pixel-perfect retro UI for modern web"
      subline="A component kit that brings cinematic, terminal-grade interfaces to React apps."
      primaryCta={<button type="button">Get started</button>}
      secondaryCta={<button type="button">View docs</button>}
    />
  )
}

export function Split() {
  return (
    <PixelHeroSection
      variant="split"
      eyebrow="New in v2"
      headline="Compose richer hero sections"
      subline="Pair a tagline with media on the side using the split variant."
      primaryCta={<button type="button">Try it</button>}
      media={<div style={{ width: '100%', height: 240, background: '#111', border: '1px solid #333' }} />}
      tone="cyan"
    />
  )
}

export function Compact() {
  return (
    <PixelHeroSection
      density="compact"
      minHeight="sm"
      headline="Compact density"
      subline="Tighter rhythm for denser layouts."
    />
  )
}
