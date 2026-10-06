import { Component, signal } from '@angular/core';
import { PixelNumberInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelNumberInput],
  template: `<pxl-number-input label="Quantity" [(value)]="value" [min]="0" [max]="100" />`,
})
export class Default {
  readonly value = signal(5);
}

@Component({
  imports: [PixelNumberInput],
  template: `
    <pxl-number-input
      label="Price"
      [(value)]="value"
      prefix="$"
      suffix="USD"
      [precision]="2"
      [step]="0.01"
      [min]="0"
    />
  `,
})
export class WithPrefixSuffix {
  readonly value = signal(19.99);
}

@Component({
  imports: [PixelNumberInput],
  template: `<pxl-number-input label="Population" [(value)]="value" thousandsSeparator="," [min]="0" />`,
})
export class ThousandsSeparator {
  readonly value = signal(1500000);
}

@Component({
  imports: [PixelNumberInput],
  template: `<pxl-number-input label="Age" [(value)]="value" hideControls [min]="0" [max]="120" />`,
})
export class HideControls {
  readonly value = signal(42);
}

@Component({
  imports: [PixelNumberInput],
  template: `
    <pxl-number-input
      label="Score"
      [(value)]="value"
      [min]="0"
      [max]="100"
      error="Score must be between 0 and 100"
      tone="red"
    />
  `,
})
export class WithError {
  readonly value = signal(150);
}
