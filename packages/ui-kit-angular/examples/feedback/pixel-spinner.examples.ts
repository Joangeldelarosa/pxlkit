import { Component } from '@angular/core';
import { PixelSpinner } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSpinner],
  template: `<pxl-spinner />`,
})
export class Default {}

@Component({
  imports: [PixelSpinner],
  template: `
    <div class="flex items-center gap-4">
      <pxl-spinner size="xs" />
      <pxl-spinner size="sm" />
      <pxl-spinner size="md" />
      <pxl-spinner size="lg" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelSpinner],
  template: `
    <div class="flex items-center gap-4">
      <pxl-spinner tone="neutral" />
      <pxl-spinner tone="green" />
      <pxl-spinner tone="cyan" />
      <pxl-spinner tone="gold" />
      <pxl-spinner tone="red" />
      <pxl-spinner tone="purple" />
      <pxl-spinner tone="pink" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelSpinner],
  template: `<pxl-spinner surface="pixel" size="lg" tone="cyan" />`,
})
export class PixelSurface {}

@Component({
  imports: [PixelSpinner],
  template: `
    <button type="button" aria-busy="true" class="inline-flex items-center gap-2">
      <pxl-spinner decorative size="sm" />
      <span>Saving…</span>
    </button>
  `,
})
export class Decorative {}
