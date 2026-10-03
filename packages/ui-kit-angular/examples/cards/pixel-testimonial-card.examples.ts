import { Component } from '@angular/core';
import { PixelTestimonialCard } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTestimonialCard],
  template: `
    <pxl-testimonial-card
      quote="pxlkit dropped the polish ceiling. Our marketing site felt like a product launch in a week."
      name="Marisol Quintero"
      role="Head of Design"
      company="Northbeam"
      [stars]="5"
      verified
    />
  `,
})
export class Default {}

@Component({
  imports: [PixelTestimonialCard],
  template: `
    <pxl-testimonial-card
      tone="cyan"
      quote="The retro surface tokens just clicked with our brand. Zero CSS surgery, all signal."
      name="Diego Salas"
      role="Staff Engineer"
      company="Halcyon Labs"
      [avatar]="{ name: 'Diego Salas', tone: 'cyan' }"
      [stars]="4"
    />
  `,
})
export class WithAvatarAndTone {}

@Component({
  imports: [PixelTestimonialCard],
  template: `
    <pxl-testimonial-card
      quoteSize="compact"
      quote="Short. Sharp. Shipped."
      name="Ana Pereira"
      role="PM"
      tone="gold"
      verified
    />
  `,
})
export class CompactQuote {}
