import React from 'react';
import { PixelTypewriter } from './PixelTypewriter';

export function Default() {
  return <PixelTypewriter text="Hello, pxlkit." />;
}

export function FastCyan() {
  return <PixelTypewriter text="Typing fast in cyan..." speed={30} tone="cyan" />;
}

export function NoCursor() {
  return <PixelTypewriter text="No blinking caret here." cursor={false} tone="gold" />;
}

export function OnView() {
  return <PixelTypewriter text="Types when scrolled into view." trigger="inView" tone="purple" />;
}
