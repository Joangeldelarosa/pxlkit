import { Component, signal } from '@angular/core';
import { PixelOTPInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelOTPInput],
  template: `<pxl-otp-input [length]="6" [(value)]="value" />`,
})
export class Default {
  readonly value = signal('');
}

@Component({
  imports: [PixelOTPInput],
  template: `<pxl-otp-input [length]="4" type="numeric" [(value)]="value" />`,
})
export class Numeric4 {
  readonly value = signal('');
}

@Component({
  imports: [PixelOTPInput],
  template: `<pxl-otp-input [length]="6" type="alphanumeric" [(value)]="value" />`,
})
export class Alphanumeric {
  readonly value = signal('');
}

@Component({
  imports: [PixelOTPInput],
  template: `<pxl-otp-input [length]="6" mask [(value)]="value" />`,
})
export class Masked {
  readonly value = signal('');
}

@Component({
  imports: [PixelOTPInput],
  template: `
    <pxl-otp-input [length]="6" [separator]="dash" [(value)]="value" />
    <ng-template #dash><span>-</span></ng-template>
  `,
})
export class WithSeparator {
  readonly value = signal('');
}
