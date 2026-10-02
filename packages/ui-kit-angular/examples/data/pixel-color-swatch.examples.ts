import { Component } from '@angular/core';
import { PixelColorSwatch } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelColorSwatch],
  template: `<pxl-color-swatch name="cyan" cssVar="--color-retro-cyan" />`,
})
export class Default {}

@Component({
  imports: [PixelColorSwatch],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
      <pxl-color-swatch name="green" cssVar="--color-retro-green" />
      <pxl-color-swatch name="cyan" cssVar="--color-retro-cyan" />
      <pxl-color-swatch name="gold" cssVar="--color-retro-gold" />
      <pxl-color-swatch name="purple" cssVar="--color-retro-purple" />
      <pxl-color-swatch name="red" cssVar="--color-retro-red" />
      <pxl-color-swatch name="pink" cssVar="--color-retro-pink" />
    </div>
  `,
})
export class Palette {}

@Component({
  imports: [PixelColorSwatch],
  template: `
    <div class="flex flex-col gap-4">
      <pxl-color-swatch name="cyan" cssVar="--color-retro-cyan" surface="pixel" />
      <pxl-color-swatch name="cyan" cssVar="--color-retro-cyan" surface="linear" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelColorSwatch],
  template: `
    <div class="grid grid-cols-2 gap-3 max-w-md">
      <pxl-color-swatch name="surface" cssVar="--color-retro-surface" />
      <pxl-color-swatch name="border" cssVar="--color-retro-border" />
      <pxl-color-swatch name="text" cssVar="--color-retro-text" />
      <pxl-color-swatch name="muted" cssVar="--color-retro-muted" />
    </div>
  `,
})
export class SurfaceTokens {}
