import { Component, signal } from '@angular/core';
import { PixelPasswordInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" placeholder="Enter password" />`,
})
export class Default {}

@Component({
  imports: [PixelPasswordInput],
  template: `
    <pxl-password-input
      label="Password"
      hint="At least 8 characters, mixing letters and numbers."
      placeholder="Enter password"
    />
  `,
})
export class WithHint {}

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" error="Password is too short." defaultValue="abc" />`,
})
export class WithError {}

@Component({
  imports: [PixelPasswordInput],
  template: `
    <div class="space-y-3">
      <pxl-password-input label="Neutral" tone="neutral" placeholder="Password" />
      <pxl-password-input label="Green" tone="green" placeholder="Password" />
      <pxl-password-input label="Cyan" tone="cyan" placeholder="Password" />
      <pxl-password-input label="Gold" tone="gold" placeholder="Password" />
      <pxl-password-input label="Red" tone="red" placeholder="Password" />
      <pxl-password-input label="Purple" tone="purple" placeholder="Password" />
      <pxl-password-input label="Pink" tone="pink" placeholder="Password" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelPasswordInput],
  template: `
    <div class="space-y-3">
      <pxl-password-input label="Small" size="sm" placeholder="Password" />
      <pxl-password-input label="Medium" size="md" placeholder="Password" />
      <pxl-password-input label="Large" size="lg" placeholder="Password" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelPasswordInput],
  template: `
    <div class="space-y-3">
      <pxl-password-input label="Pixel surface" surface="pixel" placeholder="Password" />
      <pxl-password-input label="Linear surface" surface="linear" placeholder="Password" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" disabled defaultValue="cannot-edit" />`,
})
export class Disabled {}

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" [toggleLabels]="['View', 'Mask']" placeholder="Enter password" />`,
})
export class CustomToggleLabels {}

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" [(value)]="value" [hint]="'Length: ' + value().length" />`,
})
export class Controlled {
  readonly value = signal('');
}

@Component({
  imports: [PixelPasswordInput],
  template: `<pxl-password-input label="Password" defaultValue="hunter2" />`,
})
export class Uncontrolled {}
