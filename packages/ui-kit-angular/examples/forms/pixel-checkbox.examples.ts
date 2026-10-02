import { Component, signal } from '@angular/core';
import { PixelCheckbox } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCheckbox],
  template: `<pxl-checkbox label="Accept terms" [(checked)]="checked" />`,
})
export class Default {
  readonly checked = signal(false);
}

@Component({
  imports: [PixelCheckbox],
  template: `<pxl-checkbox label="Subscribe to newsletter" [(checked)]="checked" />`,
})
export class Checked {
  readonly checked = signal(true);
}

@Component({
  imports: [PixelCheckbox],
  template: `
    <div class="space-y-2">
      <pxl-checkbox label="Neutral" tone="neutral" [(checked)]="neutral" />
      <pxl-checkbox label="Green" tone="green" [(checked)]="green" />
      <pxl-checkbox label="Cyan" tone="cyan" [(checked)]="cyan" />
      <pxl-checkbox label="Gold" tone="gold" [(checked)]="gold" />
      <pxl-checkbox label="Red" tone="red" [(checked)]="red" />
      <pxl-checkbox label="Purple" tone="purple" [(checked)]="purple" />
      <pxl-checkbox label="Pink" tone="pink" [(checked)]="pink" />
    </div>
  `,
})
export class Tones {
  readonly neutral = signal(true);
  readonly green = signal(true);
  readonly cyan = signal(true);
  readonly gold = signal(true);
  readonly red = signal(true);
  readonly purple = signal(true);
  readonly pink = signal(true);
}

@Component({
  imports: [PixelCheckbox],
  template: `
    <div class="space-y-2">
      <pxl-checkbox label="Pixel surface" surface="pixel" [(checked)]="pixel" />
      <pxl-checkbox label="Linear surface" surface="linear" [(checked)]="linear" />
    </div>
  `,
})
export class Surfaces {
  readonly pixel = signal(true);
  readonly linear = signal(true);
}

@Component({
  imports: [PixelCheckbox],
  template: `
    <div class="space-y-2">
      <pxl-checkbox label="Disabled unchecked" disabled [checked]="false" />
      <pxl-checkbox label="Disabled checked" disabled [checked]="true" />
    </div>
  `,
})
export class Disabled {}

@Component({
  imports: [PixelCheckbox],
  template: `<pxl-checkbox label="I agree to the terms" required [(checked)]="checked" />`,
})
export class Required {
  readonly checked = signal(false);
}

@Component({
  imports: [PixelCheckbox],
  template: `
    <form>
      <pxl-checkbox label="Remember me" name="remember" value="yes" [(checked)]="checked" />
    </form>
  `,
})
export class WithFormName {
  readonly checked = signal(true);
}

@Component({
  imports: [PixelCheckbox],
  template: `
    <div class="space-y-2">
      <pxl-checkbox label="Email notifications" [(checked)]="email" />
      <pxl-checkbox label="SMS notifications" [(checked)]="sms" />
      <pxl-checkbox label="Push notifications" [(checked)]="push" />
    </div>
  `,
})
export class Group {
  readonly email = signal(true);
  readonly sms = signal(false);
  readonly push = signal(true);
}
