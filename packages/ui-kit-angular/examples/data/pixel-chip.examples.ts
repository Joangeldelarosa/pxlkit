import { Component, signal } from '@angular/core';
import { PixelChip } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelChip],
  template: `<pxl-chip label="React" />`,
})
export class Default {}

@Component({
  imports: [PixelChip],
  template: `
    <div class="flex flex-wrap gap-2">
      <pxl-chip label="Neutral" tone="neutral" />
      <pxl-chip label="Green" tone="green" />
      <pxl-chip label="Cyan" tone="cyan" />
      <pxl-chip label="Gold" tone="gold" />
      <pxl-chip label="Red" tone="red" />
      <pxl-chip label="Purple" tone="purple" />
      <pxl-chip label="Pink" tone="pink" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelChip],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <pxl-chip label="Small" size="sm" />
      <pxl-chip label="Medium" size="md" />
      <pxl-chip label="Large" size="lg" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelChip],
  template: `
    <div class="flex flex-wrap gap-2">
      <pxl-chip label="Soft" variant="soft" tone="cyan" />
      <pxl-chip label="Solid" variant="solid" tone="cyan" />
      <pxl-chip label="Outline" variant="outline" tone="cyan" />
      <pxl-chip label="Ghost" variant="ghost" tone="cyan" />
    </div>
  `,
})
export class Variants {}

@Component({
  imports: [PixelChip],
  template: `
    <div class="flex flex-wrap gap-2">
      <pxl-chip label="Pixel" surface="pixel" tone="green" />
      <pxl-chip label="Linear" surface="linear" tone="green" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelChip],
  template: `
    <pxl-chip label="TypeScript" tone="cyan" [iconLeft]="ts" />
    <ng-template #ts><span aria-hidden="true">TS</span></ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelChip],
  template: `<button pxlChip label="Click me" tone="gold" (click)="onClick()"></button>`,
})
export class Clickable {
  onClick(): void {}
}

@Component({
  imports: [PixelChip],
  template: `
    @if (visible()) {
      <pxl-chip label="Remove me" tone="red" deletable (delete)="visible.set(false)" />
    }
  `,
})
export class Deletable {
  readonly visible = signal(true);
}

@Component({
  imports: [PixelChip],
  template: `
    @if (visible()) {
      <pxl-chip label="Tag" tone="purple" clickable deletable (clicked)="select()" (delete)="visible.set(false)" />
    }
  `,
})
export class ClickableAndDeletable {
  readonly visible = signal(true);

  select(): void {}
}
