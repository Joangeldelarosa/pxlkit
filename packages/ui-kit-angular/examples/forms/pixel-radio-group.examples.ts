import { Component, signal } from '@angular/core';
import { PixelRadioGroup } from '@pxlkit/ui-kit-angular';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

@Component({
  imports: [PixelRadioGroup],
  template: `<fieldset pxlRadioGroup label="Plan" [options]="plans" [(value)]="value"></fieldset>`,
})
export class Default {
  readonly plans = PLANS;
  readonly value = signal('free');
}

@Component({
  imports: [PixelRadioGroup],
  template: `
    <div class="space-y-2">
      <fieldset pxlRadioGroup label="Selected plan" [options]="plans" [(value)]="value" tone="cyan"></fieldset>
      <p class="text-xs text-retro-muted">Picked: {{ value() }}</p>
    </div>
  `,
})
export class Controlled {
  readonly plans = PLANS;
  readonly value = signal('pro');
}

@Component({
  imports: [PixelRadioGroup],
  template: `
    <div class="grid grid-cols-2 gap-6">
      <fieldset pxlRadioGroup label="Neutral" tone="neutral" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Green" tone="green" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Cyan" tone="cyan" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Gold" tone="gold" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Red" tone="red" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Purple" tone="purple" [options]="plans" [(value)]="value"></fieldset>
      <fieldset pxlRadioGroup label="Pink" tone="pink" [options]="plans" [(value)]="value"></fieldset>
    </div>
  `,
})
export class Tones {
  readonly plans = PLANS;
  readonly value = signal('pro');
}

@Component({
  imports: [PixelRadioGroup],
  template: `
    <div class="grid grid-cols-2 gap-6">
      <fieldset pxlRadioGroup label="Pixel surface" surface="pixel" [options]="plans" [(value)]="pixel"></fieldset>
      <fieldset pxlRadioGroup label="Linear surface" surface="linear" [options]="plans" [(value)]="linear"></fieldset>
    </div>
  `,
})
export class Surfaces {
  readonly plans = PLANS;
  readonly pixel = signal('pro');
  readonly linear = signal('pro');
}

@Component({
  imports: [PixelRadioGroup],
  template: `<fieldset pxlRadioGroup label="Plan (locked)" value="pro" [options]="plans" disabled></fieldset>`,
})
export class Disabled {
  readonly plans = PLANS;
}

@Component({
  imports: [PixelRadioGroup],
  template: `
    <fieldset pxlRadioGroup label="Pick a plan to continue" [options]="plans" [(value)]="value" required></fieldset>
  `,
})
export class Required {
  readonly plans = PLANS;
  readonly value = signal('');
}

@Component({
  imports: [PixelRadioGroup],
  template: `
    <form>
      <fieldset pxlRadioGroup label="Plan" name="plan" [options]="plans" [(value)]="value" required></fieldset>
    </form>
  `,
})
export class WithFormName {
  readonly plans = PLANS;
  readonly value = signal('pro');
}
