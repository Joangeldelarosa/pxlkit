import { Component, signal } from '@angular/core';
import { PixelSwitch } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSwitch],
  template: `<pxl-switch label="Enable notifications" [(checked)]="on" />`,
})
export class Default {
  readonly on = signal(false);
}

@Component({
  imports: [PixelSwitch],
  template: `<pxl-switch label="Dark mode" [(checked)]="on" />`,
})
export class Checked {
  readonly on = signal(true);
}

@Component({
  imports: [PixelSwitch],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-switch label="Neutral" tone="neutral" [(checked)]="on" />
      <pxl-switch label="Green" tone="green" [(checked)]="on" />
      <pxl-switch label="Cyan" tone="cyan" [(checked)]="on" />
      <pxl-switch label="Gold" tone="gold" [(checked)]="on" />
      <pxl-switch label="Red" tone="red" [(checked)]="on" />
      <pxl-switch label="Purple" tone="purple" [(checked)]="on" />
      <pxl-switch label="Pink" tone="pink" [(checked)]="on" />
    </div>
  `,
})
export class Tones {
  readonly on = signal(true);
}

@Component({
  imports: [PixelSwitch],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-switch label="Pixel surface" surface="pixel" [(checked)]="a" />
      <pxl-switch label="Linear surface" surface="linear" [(checked)]="b" />
    </div>
  `,
})
export class Surfaces {
  readonly a = signal(true);
  readonly b = signal(true);
}

@Component({
  imports: [PixelSwitch],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-switch label="Disabled off" [checked]="false" disabled />
      <pxl-switch label="Disabled on" [checked]="true" disabled />
    </div>
  `,
})
export class Disabled {}

@Component({
  imports: [PixelSwitch],
  template: `
    <pxl-switch label="Subscribe to newsletter" name="newsletter" value="yes" [(checked)]="on" required />
  `,
})
export class WithFormName {
  readonly on = signal(true);
}
