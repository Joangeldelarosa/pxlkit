import React from 'react';
import { PixelCodeInline } from '../data-display';

export function Default() {
  return <PixelCodeInline>npm install</PixelCodeInline>;
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelCodeInline tone="neutral">neutral</PixelCodeInline>
      <PixelCodeInline tone="cyan">cyan</PixelCodeInline>
      <PixelCodeInline tone="green">green</PixelCodeInline>
      <PixelCodeInline tone="gold">gold</PixelCodeInline>
      <PixelCodeInline tone="red">red</PixelCodeInline>
      <PixelCodeInline tone="purple">purple</PixelCodeInline>
      <PixelCodeInline tone="pink">pink</PixelCodeInline>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PixelCodeInline surface="pixel">surface=&quot;pixel&quot;</PixelCodeInline>
      <PixelCodeInline surface="linear">surface=&quot;linear&quot;</PixelCodeInline>
    </div>
  );
}

export function InlineInProse() {
  return (
    <p className="text-sm text-retro-text">
      Run <PixelCodeInline>pnpm dev</PixelCodeInline> to start the local server,
      then open <PixelCodeInline tone="green">http://localhost:3000</PixelCodeInline>.
    </p>
  );
}

export function CodeSamples() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        Import: <PixelCodeInline>{`import { PixelCodeInline } from '@pxlkit/ui'`}</PixelCodeInline>
      </div>
      <div>
        Hotkey: <PixelCodeInline tone="purple">Ctrl+K</PixelCodeInline>
      </div>
      <div>
        Error: <PixelCodeInline tone="red">EACCES</PixelCodeInline>
      </div>
    </div>
  );
}
