import { Component } from '@angular/core';
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="3" [gap]="4">
      <pxl-bento-cell kind="feature" tone="neutral" span="2x1">
        <h3 class="text-sm font-semibold">Feature cell</h3>
        <p class="text-sm text-retro-muted">Span 2x1 with feature layout.</p>
      </pxl-bento-cell>
      <pxl-bento-cell kind="stat" tone="cyan" span="1x1">
        <span class="text-xs text-retro-muted">Active</span>
        <strong class="text-2xl">128</strong>
      </pxl-bento-cell>
      <pxl-bento-cell kind="compact" tone="green" span="1x1">
        <span class="text-sm">Compact</span>
      </pxl-bento-cell>
    </pxl-bento>
  `,
})
export class Default {}

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="3" [gap]="3">
      <pxl-bento-cell tone="purple" kind="stat">
        <span class="text-xs text-retro-muted">Purple</span>
        <strong class="text-2xl">42</strong>
      </pxl-bento-cell>
      <pxl-bento-cell tone="gold" kind="stat">
        <span class="text-xs text-retro-muted">Gold</span>
        <strong class="text-2xl">7</strong>
      </pxl-bento-cell>
      <pxl-bento-cell tone="red" kind="stat">
        <span class="text-xs text-retro-muted">Red</span>
        <strong class="text-2xl">3</strong>
      </pxl-bento-cell>
    </pxl-bento>
  `,
})
export class Tones {}

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="3" [gap]="4">
      <pxl-bento-cell kind="media" tone="neutral" span="2x2">
        <div class="flex h-full min-h-[160px] items-center justify-center bg-retro-surface/40 text-sm text-retro-muted">
          Media slot
        </div>
      </pxl-bento-cell>
      <pxl-bento-cell kind="feature" tone="cyan" span="1x1">
        <h3 class="text-sm font-semibold">Caption</h3>
        <p class="text-sm text-retro-muted">Pairs with media.</p>
      </pxl-bento-cell>
    </pxl-bento>
  `,
})
export class MediaCell {}
