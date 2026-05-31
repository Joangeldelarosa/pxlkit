import React from 'react';
import { PixelIconFrame } from './PixelIconFrame';

const Glyph = () => (
  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{'>_'}</span>
);

const Dot = () => (
  <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'currentColor', display: 'inline-block' }} />
);

export function Default() {
  return <PixelIconFrame icon={<Glyph />} />;
}

export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <PixelIconFrame icon={<Glyph />} tone="neutral" />
      <PixelIconFrame icon={<Glyph />} tone="cyan" />
      <PixelIconFrame icon={<Glyph />} tone="green" />
      <PixelIconFrame icon={<Glyph />} tone="gold" />
      <PixelIconFrame icon={<Glyph />} tone="red" />
      <PixelIconFrame icon={<Glyph />} tone="purple" />
      <PixelIconFrame icon={<Glyph />} tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <PixelIconFrame icon={<Glyph />} size={48} />
      <PixelIconFrame icon={<Glyph />} size={56} />
      <PixelIconFrame icon={<Glyph />} size={64} />
      <PixelIconFrame icon={<Glyph />} size={80} />
      <PixelIconFrame icon={<Glyph />} size={112} />
    </div>
  );
}

export function Shapes() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <PixelIconFrame icon={<Glyph />} shape="square" />
      <PixelIconFrame icon={<Glyph />} shape="rounded" />
      <PixelIconFrame icon={<Glyph />} shape="circle" />
    </div>
  );
}

export function WithAccent() {
  return (
    <PixelIconFrame
      icon={<Glyph />}
      tone="cyan"
      accent={{ icon: <Dot />, position: 'top-right' }}
    />
  );
}
