import React from 'react';
import { PixelHeroMedia } from './PixelHeroMedia';

const Placeholder = ({ label }: { label: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-mono text-retro-muted">
    {label}
  </div>
);

export function Default() {
  return (
    <PixelHeroMedia ratio="16/10">
      <Placeholder label="16:10 media" />
    </PixelHeroMedia>
  );
}

export function Framed() {
  return (
    <PixelHeroMedia ratio="16/9" framed tone="cyan" caption="Framed hero with caption">
      <Placeholder label="16:9 framed" />
    </PixelHeroMedia>
  );
}

export function Square() {
  return (
    <PixelHeroMedia ratio="1/1" framed tone="purple">
      <Placeholder label="1:1 square" />
    </PixelHeroMedia>
  );
}
