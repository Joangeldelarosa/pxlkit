import React from 'react';
import { PixelMouseParallax } from './PixelMouseParallax';

export function Default() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded border border-zinc-800 bg-zinc-950">
      <PixelMouseParallax strength={20}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200">
          Follows the cursor
        </div>
      </PixelMouseParallax>
    </div>
  );
}

export function Inverted() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded border border-zinc-800 bg-zinc-950">
      <PixelMouseParallax strength={30} invert>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-purple-500/20 px-4 py-2 text-sm text-purple-200">
          Repels from the cursor
        </div>
      </PixelMouseParallax>
    </div>
  );
}
