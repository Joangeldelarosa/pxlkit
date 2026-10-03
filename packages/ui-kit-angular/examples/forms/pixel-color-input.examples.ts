import { Component, signal } from '@angular/core';
import { PixelColorInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelColorInput],
  template: `<pxl-color-input label="Brand color" [(value)]="value" />`,
})
export class Default {
  readonly value = signal('#06b6d4');
}

@Component({
  imports: [PixelColorInput],
  template: `<pxl-color-input label="Accent color" format="rgb" hint="Stored as rgb()" [(value)]="value" />`,
})
export class RgbFormat {
  readonly value = signal('rgb(34, 197, 94)');
}

@Component({
  imports: [PixelColorInput],
  template: `<pxl-color-input label="Theme tone" [presets]="presets" [(value)]="value" />`,
})
export class CustomPresets {
  readonly presets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#a855f7'];
  readonly value = signal('#ef4444');
}

@Component({
  imports: [PixelColorInput],
  template: `<pxl-color-input label="Background" defaultValue="not-a-color" error="Invalid color value" />`,
})
export class WithError {}
