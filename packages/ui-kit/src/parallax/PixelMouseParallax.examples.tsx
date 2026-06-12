import React from 'react';
import { PixelMouseParallax } from './PixelMouseParallax';

export function Default() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded border border-retro-border bg-retro-bg">
      <PixelMouseParallax strength={20}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-retro-cyan/20 px-4 py-2 text-sm text-retro-cyan">
          Follows the cursor
        </div>
      </PixelMouseParallax>
    </div>
  );
}

export function Inverted() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded border border-retro-border bg-retro-bg">
      <PixelMouseParallax strength={30} invert>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-retro-purple/20 px-4 py-2 text-sm text-retro-purple">
          Repels from the cursor
        </div>
      </PixelMouseParallax>
    </div>
  );
}
