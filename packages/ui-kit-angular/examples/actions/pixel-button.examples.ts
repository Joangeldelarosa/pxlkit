import { Component } from '@angular/core';
import { PixelButton } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelButton],
  template: `<button pxlButton>Click me</button>`,
})
export class Default {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton tone="green">Green</button>
      <button pxlButton tone="cyan">Cyan</button>
      <button pxlButton tone="gold">Gold</button>
      <button pxlButton tone="red">Red</button>
      <button pxlButton tone="purple">Purple</button>
      <button pxlButton tone="pink">Pink</button>
      <button pxlButton tone="neutral">Neutral</button>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <button pxlButton size="sm">Small</button>
      <button pxlButton size="md">Medium</button>
      <button pxlButton size="lg">Large</button>
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton variant="solid">Solid</button>
      <button pxlButton variant="soft">Soft</button>
      <button pxlButton variant="outline">Outline</button>
      <button pxlButton variant="ghost">Ghost</button>
    </div>
  `,
})
export class Variants {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton surface="pixel">Pixel</button>
      <button pxlButton surface="linear">Linear</button>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton [iconLeft]="arrow">Leading</button>
      <button pxlButton [iconRight]="arrow">Trailing</button>
      <button pxlButton [iconLeft]="arrow" [iconRight]="arrow">Both</button>
    </div>
    <ng-template #arrow><span aria-hidden="true" class="inline-block h-3.5 w-3.5">→</span></ng-template>
  `,
})
export class WithIcons {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton loading>Saving</button>
      <button pxlButton loading tone="cyan" variant="outline">Loading</button>
    </div>
  `,
})
export class Loading {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton disabled>Disabled</button>
      <button pxlButton disabled variant="outline">Disabled outline</button>
    </div>
  `,
})
export class Disabled {}

@Component({
  imports: [PixelButton],
  template: `
    <div class="w-full max-w-sm">
      <button pxlButton fullWidth>Full width</button>
    </div>
  `,
})
export class FullWidth {}

@Component({
  imports: [PixelButton],
  template: `
    <a pxlButton tone="cyan" href="https://pxlkit.xyz" target="_blank" rel="noreferrer">External link</a>
  `,
})
export class AsChild {}
