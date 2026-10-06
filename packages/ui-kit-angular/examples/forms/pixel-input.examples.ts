import { Component, signal } from '@angular/core';
import { PixelInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Username" placeholder="hero@pxlkit.xyz" hint="Your retro alias" />`,
})
export class Default {}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Email" type="email" placeholder="hero@pxlkit.xyz" [(value)]="value" tone="cyan" />`,
})
export class Controlled {
  readonly value = signal('');
}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Display name" defaultValue="Pixel Hero" hint="Edit me — uncontrolled" />`,
})
export class Uncontrolled {}

@Component({
  imports: [PixelInput],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input label="Neutral" tone="neutral" defaultValue="neutral" />
      <pxl-input label="Cyan" tone="cyan" defaultValue="cyan" />
      <pxl-input label="Green" tone="green" defaultValue="green" />
      <pxl-input label="Gold" tone="gold" defaultValue="gold" />
      <pxl-input label="Purple" tone="purple" defaultValue="purple" />
      <pxl-input label="Pink" tone="pink" defaultValue="pink" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelInput],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input label="Small" size="sm" placeholder="sm" />
      <pxl-input label="Medium" size="md" placeholder="md" />
      <pxl-input label="Large" size="lg" placeholder="lg" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelInput],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input label="Pixel" surface="pixel" placeholder="pixel surface" />
      <pxl-input label="Linear" surface="linear" placeholder="linear surface" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelInput],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input label="Amount" [prefix]="dollar" [suffix]="usd" defaultValue="42" />
      <pxl-input label="Search" [prefix]="search" placeholder="Find anything" />
    </div>
    <ng-template #dollar><span class="text-xs">$</span></ng-template>
    <ng-template #usd><span class="text-xs">USD</span></ng-template>
    <ng-template #search><span aria-hidden="true">?</span></ng-template>
  `,
})
export class WithPrefixSuffix {}

@Component({
  imports: [PixelInput],
  template: `
    <pxl-input label="Website" [addonLeft]="protocol" [addonRight]="tld" defaultValue="pxlkit" />
    <ng-template #protocol><span class="text-xs">https://</span></ng-template>
    <ng-template #tld><span class="text-xs">.xyz</span></ng-template>
  `,
})
export class WithAddons {}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Clearable" clearable [(value)]="value" />`,
})
export class Clearable {
  readonly value = signal('clear me');
}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Verifying handle" defaultValue="pxlhero" loading />`,
})
export class Loading {}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Disabled" defaultValue="cannot edit" disabled />`,
})
export class Disabled {}

@Component({
  imports: [PixelInput],
  template: `
    <pxl-input label="Email" defaultValue="not-an-email" error="Please enter a valid email address" tone="red" />
  `,
})
export class WithError {}

@Component({
  imports: [PixelInput],
  template: `<pxl-input label="Bio" [(value)]="value" [showCount]="{ max: 80 }" hint="Keep it short" />`,
})
export class WithCharCount {
  readonly value = signal('Hello');
}
