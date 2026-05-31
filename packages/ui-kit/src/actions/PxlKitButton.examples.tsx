import React from 'react';
import { PxlKitButton } from '../actions';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export function Default() {
  return <PxlKitButton label="Favorite" icon={<StarIcon />} />;
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-2">
      <PxlKitButton label="Neutral" icon={<StarIcon />} tone="neutral" />
      <PxlKitButton label="Green" icon={<StarIcon />} tone="green" />
      <PxlKitButton label="Cyan" icon={<StarIcon />} tone="cyan" />
      <PxlKitButton label="Gold" icon={<StarIcon />} tone="gold" />
      <PxlKitButton label="Red" icon={<StarIcon />} tone="red" />
      <PxlKitButton label="Purple" icon={<StarIcon />} tone="purple" />
      <PxlKitButton label="Pink" icon={<StarIcon />} tone="pink" />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-2">
      <PxlKitButton label="Small" icon={<PlusIcon />} size="sm" />
      <PxlKitButton label="Medium" icon={<PlusIcon />} size="md" />
      <PxlKitButton label="Large" icon={<PlusIcon />} size="lg" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex gap-2">
      <PxlKitButton label="Pixel surface" icon={<StarIcon />} surface="pixel" />
      <PxlKitButton label="Linear surface" icon={<StarIcon />} surface="linear" />
    </div>
  );
}

export function Disabled() {
  return <PxlKitButton label="Disabled" icon={<StarIcon />} disabled />;
}
