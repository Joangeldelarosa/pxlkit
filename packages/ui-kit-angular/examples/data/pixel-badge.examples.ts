import { Component } from '@angular/core';
import { PixelBadge } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBadge],
  template: `<pxl-badge>NEW</pxl-badge>`,
})
export class Default {}

@Component({
  imports: [PixelBadge],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <pxl-badge tone="neutral">neutral</pxl-badge>
      <pxl-badge tone="green">green</pxl-badge>
      <pxl-badge tone="cyan">cyan</pxl-badge>
      <pxl-badge tone="gold">gold</pxl-badge>
      <pxl-badge tone="red">red</pxl-badge>
      <pxl-badge tone="purple">purple</pxl-badge>
      <pxl-badge tone="pink">pink</pxl-badge>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelBadge],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <pxl-badge size="sm" tone="cyan">small</pxl-badge>
      <pxl-badge size="md" tone="cyan">medium</pxl-badge>
      <pxl-badge size="lg" tone="cyan">large</pxl-badge>
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelBadge],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <pxl-badge variant="soft" tone="green">soft</pxl-badge>
      <pxl-badge variant="solid" tone="green">solid</pxl-badge>
      <pxl-badge variant="outline" tone="green">outline</pxl-badge>
      <pxl-badge variant="ghost" tone="green">ghost</pxl-badge>
    </div>
  `,
})
export class Variants {}

@Component({
  imports: [PixelBadge],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <pxl-badge surface="pixel" tone="gold">pixel</pxl-badge>
      <pxl-badge surface="linear" tone="gold">linear</pxl-badge>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelBadge],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <pxl-badge tone="green" [iconLeft]="dot">online</pxl-badge>
      <pxl-badge tone="red" [iconLeft]="dot">error</pxl-badge>
      <pxl-badge tone="gold" [iconLeft]="dot">warn</pxl-badge>
    </div>
    <ng-template #dot>
      <span
        aria-hidden="true"
        style="width: 6px; height: 6px; border-radius: 9999px; background: currentColor; display: inline-block"
      ></span>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelBadge],
  template: `<button pxlBadge tone="cyan" variant="outline" (click)="onClick()">click me</button>`,
})
export class Clickable {
  onClick(): void {}
}
