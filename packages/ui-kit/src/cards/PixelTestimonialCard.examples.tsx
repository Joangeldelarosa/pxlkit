import React from 'react';
import { PixelTestimonialCard } from './PixelTestimonialCard';

export function Default() {
  return (
    <PixelTestimonialCard
      quote="pxlkit dropped the polish ceiling. Our marketing site felt like a product launch in a week."
      name="Marisol Quintero"
      role="Head of Design"
      company="Northbeam"
      stars={5}
      verified
    />
  );
}

export function WithAvatarAndTone() {
  return (
    <PixelTestimonialCard
      tone="cyan"
      quote="The retro surface tokens just clicked with our brand. Zero CSS surgery, all signal."
      name="Diego Salas"
      role="Staff Engineer"
      company="Halcyon Labs"
      avatar={{ name: 'Diego Salas', tone: 'cyan' }}
      stars={4}
    />
  );
}

export function CompactQuote() {
  return (
    <PixelTestimonialCard
      quoteSize="compact"
      quote="Short. Sharp. Shipped."
      name="Ana Pereira"
      role="PM"
      tone="gold"
      verified
    />
  );
}
