import { Component } from '@angular/core';
import { PixelRibbon } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelRibbon],
  template: `
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <pxl-ribbon>New</pxl-ribbon>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelRibbon],
  template: `
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <pxl-ribbon position="corner-tr" tone="red">Hot</pxl-ribbon>
    </div>
  `,
})
export class CornerTilted {}

@Component({
  imports: [PixelRibbon],
  template: `
    <div class="flex flex-wrap gap-6">
      <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
        <div>Card content</div>
        <pxl-ribbon tone="green">Free</pxl-ribbon>
      </div>
      <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
        <div>Card content</div>
        <pxl-ribbon tone="cyan">Beta</pxl-ribbon>
      </div>
      <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
        <div>Card content</div>
        <pxl-ribbon tone="purple">Pro</pxl-ribbon>
      </div>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelRibbon],
  template: `
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <pxl-ribbon position="top-left" offset="lg" tone="gold">Sale</pxl-ribbon>
    </div>
  `,
})
export class PositionLeft {}
