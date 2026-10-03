import { Component } from '@angular/core';
import { PixelIconFrame } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelIconFrame],
  template: `
    <pxl-icon-frame [icon]="glyph" />
    <ng-template #glyph><span style="font-family: monospace; font-weight: 700">&gt;_</span></ng-template>
  `,
})
export class Default {}

@Component({
  imports: [PixelIconFrame],
  template: `
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <pxl-icon-frame [icon]="glyph" tone="neutral" />
      <pxl-icon-frame [icon]="glyph" tone="cyan" />
      <pxl-icon-frame [icon]="glyph" tone="green" />
      <pxl-icon-frame [icon]="glyph" tone="gold" />
      <pxl-icon-frame [icon]="glyph" tone="red" />
      <pxl-icon-frame [icon]="glyph" tone="purple" />
      <pxl-icon-frame [icon]="glyph" tone="pink" />
    </div>
    <ng-template #glyph><span style="font-family: monospace; font-weight: 700">&gt;_</span></ng-template>
  `,
})
export class Tones {}

@Component({
  imports: [PixelIconFrame],
  template: `
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
      <pxl-icon-frame [icon]="glyph" [size]="48" />
      <pxl-icon-frame [icon]="glyph" [size]="56" />
      <pxl-icon-frame [icon]="glyph" [size]="64" />
      <pxl-icon-frame [icon]="glyph" [size]="80" />
      <pxl-icon-frame [icon]="glyph" [size]="112" />
    </div>
    <ng-template #glyph><span style="font-family: monospace; font-weight: 700">&gt;_</span></ng-template>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelIconFrame],
  template: `
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <pxl-icon-frame [icon]="glyph" shape="square" />
      <pxl-icon-frame [icon]="glyph" shape="rounded" />
      <pxl-icon-frame [icon]="glyph" shape="circle" />
    </div>
    <ng-template #glyph><span style="font-family: monospace; font-weight: 700">&gt;_</span></ng-template>
  `,
})
export class Shapes {}

@Component({
  imports: [PixelIconFrame],
  template: `
    <pxl-icon-frame [icon]="glyph" tone="cyan" [accent]="{ icon: dot, position: 'top-right' }" />
    <ng-template #glyph><span style="font-family: monospace; font-weight: 700">&gt;_</span></ng-template>
    <ng-template #dot>
      <span style="width: 6px; height: 6px; border-radius: 9999px; background: currentColor; display: inline-block"></span>
    </ng-template>
  `,
})
export class WithAccent {}
