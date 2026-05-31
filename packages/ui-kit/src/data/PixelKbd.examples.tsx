import React from 'react';
import { PixelKbd } from '../data-display';

export function Default() {
  return <PixelKbd>Enter</PixelKbd>;
}

export function CommonKeys() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelKbd>Esc</PixelKbd>
      <PixelKbd>Tab</PixelKbd>
      <PixelKbd>Enter</PixelKbd>
      <PixelKbd>Space</PixelKbd>
      <PixelKbd>Shift</PixelKbd>
    </div>
  );
}

export function Combo() {
  return (
    <div className="flex items-center gap-1 text-xs">
      <PixelKbd>Ctrl</PixelKbd>
      <span aria-hidden>+</span>
      <PixelKbd>K</PixelKbd>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PixelKbd surface="pixel">P</PixelKbd>
      <PixelKbd surface="linear">L</PixelKbd>
    </div>
  );
}

export function InlineInProse() {
  return (
    <p className="text-sm text-retro-text">
      Press <PixelKbd>/</PixelKbd> to focus the search bar, then <PixelKbd>Esc</PixelKbd> to dismiss it.
    </p>
  );
}
