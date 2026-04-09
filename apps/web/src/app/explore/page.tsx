'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';

const ProceduralTerrain = dynamic(() => import('../../components/procedural-terrain'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex items-center justify-center bg-retro-bg">
      <div className="text-center space-y-3">
        <div className="font-pixel text-sm sm:text-base text-retro-green animate-pulse">
          Generating World…
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-retro-green/60 rounded-sm animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] text-retro-muted/50">
          Loading Three.js + Terrain Engine…
        </p>
      </div>
    </div>
  ),
});

/**
 * Explore page — immersive full-screen mode.
 * Hides the footer and background grid to maximize the 3D viewport.
 */
export default function ExplorePage() {
  // Hide footer and background grid for immersive experience
  useEffect(() => {
    const footer = document.querySelector('footer');
    const gridBg = document.querySelector('[data-pxlkit="grid-bg"]') as HTMLElement | null;

    if (footer) footer.style.display = 'none';
    if (gridBg) gridBg.style.display = 'none';

    return () => {
      if (footer) footer.style.display = '';
      if (gridBg) gridBg.style.display = '';
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex items-center justify-center bg-retro-bg">
          <div className="font-pixel text-sm text-retro-green animate-pulse">Loading…</div>
        </div>
      }
    >
      <ProceduralTerrain />
    </Suspense>
  );
}
