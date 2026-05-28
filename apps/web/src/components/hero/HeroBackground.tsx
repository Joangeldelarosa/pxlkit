'use client';

import { memo } from 'react';

/**
 * Decorative back-most layer for the hero: radial colour glows, vignette,
 * top/bottom + side fade-to-bg, and a faint SVG film grain in overlay blend.
 * Purely visual — no interactivity, aria-hidden.
 */
export const HeroBackground = memo(function HeroBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {/* Radial colour glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-retro-green/8 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-retro-purple/6 rounded-full blur-[120px]" />
      <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-retro-gold/5 rounded-full blur-[100px]" />

      {/* Inner vignette */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.55)' }}
      />

      {/* Fade-to-bg on the edges so the icon field never feels clipped */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-retro-bg" />
      <div className="absolute inset-0 bg-gradient-to-r from-retro-bg/40 via-transparent to-retro-bg/40" />

      {/* Film grain via fractal-noise SVG, very faint */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-overlay"
        preserveAspectRatio="none"
      >
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>
    </div>
  );
});
