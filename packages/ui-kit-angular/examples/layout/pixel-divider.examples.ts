import { Component } from '@angular/core';
import { PixelDivider } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelDivider],
  template: `<pxl-divider />`,
})
export class Default {}

@Component({
  imports: [PixelDivider],
  template: `<pxl-divider label="Section" />`,
})
export class WithLabel {}

@Component({
  imports: [PixelDivider],
  template: `
    <div class="flex flex-col gap-4">
      <pxl-divider label="Neutral" tone="neutral" />
      <pxl-divider label="Green" tone="green" />
      <pxl-divider label="Cyan" tone="cyan" />
      <pxl-divider label="Gold" tone="gold" />
      <pxl-divider label="Red" tone="red" />
      <pxl-divider label="Purple" tone="purple" />
      <pxl-divider label="Pink" tone="pink" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelDivider],
  template: `
    <div>
      <pxl-divider label="None" spacing="none" />
      <pxl-divider label="Small" spacing="sm" />
      <pxl-divider label="Medium" spacing="md" />
      <pxl-divider label="Large" spacing="lg" />
    </div>
  `,
})
export class Spacings {}

@Component({
  imports: [PixelDivider],
  template: `
    <div class="flex flex-col gap-6">
      <pxl-divider label="Pixel surface" surface="pixel" />
      <pxl-divider label="Linear surface" surface="linear" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelDivider],
  template: `
    <div class="flex flex-col gap-6">
      <pxl-divider surface="pixel" />
      <pxl-divider surface="linear" />
    </div>
  `,
})
export class PlainRule {}
