import React from 'react';
import { PixelAvatar } from '../data-display';

export function Default() {
  return <PixelAvatar name="Joangel De La Rosa" />;
}

export function Sizes() {
  return (
    <div className="flex items-end gap-3">
      <PixelAvatar name="Ana Lopez" size="xs" />
      <PixelAvatar name="Ana Lopez" size="sm" />
      <PixelAvatar name="Ana Lopez" size="md" />
      <PixelAvatar name="Ana Lopez" size="lg" />
      <PixelAvatar name="Ana Lopez" size="xl" />
    </div>
  );
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-3">
      <PixelAvatar name="Green User" tone="green" />
      <PixelAvatar name="Cyan User" tone="cyan" />
      <PixelAvatar name="Gold User" tone="gold" />
      <PixelAvatar name="Red User" tone="red" />
      <PixelAvatar name="Purple User" tone="purple" />
      <PixelAvatar name="Pink User" tone="pink" />
      <PixelAvatar name="Neutral User" tone="neutral" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex items-center gap-3">
      <PixelAvatar name="Pixel Surface" surface="pixel" />
      <PixelAvatar name="Linear Surface" surface="linear" />
    </div>
  );
}

export function Shapes() {
  return (
    <div className="flex items-center gap-3">
      <PixelAvatar name="Circle Shape" shape="circle" />
      <PixelAvatar name="Rounded Shape" shape="rounded" />
      <PixelAvatar name="Square Shape" shape="square" />
    </div>
  );
}

export function Statuses() {
  return (
    <div className="flex items-center gap-3">
      <PixelAvatar name="Online User" status="online" />
      <PixelAvatar name="Away User" status="away" />
      <PixelAvatar name="Busy User" status="busy" />
      <PixelAvatar name="Offline User" status="offline" />
    </div>
  );
}

export function WithImage() {
  return (
    <PixelAvatar
      name="Joangel"
      src="https://i.pravatar.cc/80?img=12"
      size="lg"
      status="online"
    />
  );
}

export function ColorSeed() {
  return (
    <div className="flex items-center gap-3">
      <PixelAvatar name="Alice Adams" colorSeed="alice@example.com" />
      <PixelAvatar name="Bob Brown" colorSeed="bob@example.com" />
      <PixelAvatar name="Carol Chen" colorSeed="carol@example.com" />
      <PixelAvatar name="Dave Diaz" colorSeed="dave@example.com" />
    </div>
  );
}
