import { Component } from '@angular/core';
import { PixelHeroSection } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      eyebrow="Introducing"
      headline="Pixel-perfect retro UI for modern web"
      subline="A component kit that brings cinematic, terminal-grade interfaces to React apps."
      [primaryCta]="getStarted"
      [secondaryCta]="viewDocs"
    ></section>
    <ng-template #getStarted><button type="button">Get started</button></ng-template>
    <ng-template #viewDocs><button type="button">View docs</button></ng-template>
  `,
})
export class Default {}

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      variant="split"
      eyebrow="New in v2"
      headline="Compose richer hero sections"
      subline="Pair a tagline with media on the side using the split variant."
      [primaryCta]="tryIt"
      [media]="media"
      tone="cyan"
    ></section>
    <ng-template #tryIt><button type="button">Try it</button></ng-template>
    <ng-template #media>
      <div style="width: 100%; height: 240px; background: #111; border: 1px solid #333"></div>
    </ng-template>
  `,
})
export class Split {}

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      density="compact"
      minHeight="sm"
      headline="Compact density"
      subline="Tighter rhythm for denser layouts."
    ></section>
  `,
})
export class Compact {}

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      eyebrow="Boot sequence"
      headline="Loading retro interfaces"
      headlineEffect="typewriter"
      subline="The headline types itself out; screen readers get it whole from the start."
    ></section>
  `,
})
export class TypewriterHeadline {}

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      density="compact"
      minHeight="sm"
      headline="Signal lost"
      headlineEffect="glitch"
      subline="The headline glitches, and holds still for readers who prefer reduced motion."
      tone="red"
    ></section>
  `,
})
export class GlitchHeadline {}

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      as="h2"
      density="compact"
      minHeight="sm"
      eyebrow="Embedded"
      headline="A hero inside a page"
      subline="Its headline is an h2, under the page's own h1."
    ></section>
  `,
})
export class HeadingLevel {}
