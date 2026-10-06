import { Component } from '@angular/core';
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="3" [gap]="4">
      <pxl-bento-cell span="2x2" kind="feature" tone="cyan">
        <strong>Feature</strong>
        <span>Spans 2x2 with a feature layout.</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="stat" tone="green">
        <strong>42</strong>
        <span>Stats</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="compact" tone="gold">
        <span>Compact</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="2x1" kind="feature" tone="purple">
        <strong>Wide</strong>
        <span>Spans 2x1.</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="media" tone="neutral">
        <div class="h-full w-full bg-retro-surface"></div>
      </pxl-bento-cell>
    </pxl-bento>
  `,
})
export class Default {}

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="4" [gap]="3">
      <pxl-bento-cell span="2x2" kind="feature" tone="cyan">
        <strong>Hero</strong>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="stat" tone="green">
        <strong>12</strong>
        <span>Active</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="stat" tone="gold">
        <strong>87%</strong>
        <span>Uptime</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="compact" tone="red">
        <span>Alert</span>
      </pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="compact" tone="purple">
        <span>Tag</span>
      </pxl-bento-cell>
    </pxl-bento>
  `,
})
export class FourColumns {}

@Component({
  imports: [PixelBento, PixelBentoCell],
  template: `
    <pxl-bento [columns]="3" [gap]="4">
      <pxl-bento-cell span="1x1" kind="feature" tone="neutral">Neutral</pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="feature" tone="cyan">Cyan</pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="feature" tone="green">Green</pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="feature" tone="gold">Gold</pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="feature" tone="red">Red</pxl-bento-cell>
      <pxl-bento-cell span="1x1" kind="feature" tone="purple">Purple</pxl-bento-cell>
    </pxl-bento>
  `,
})
export class Cells {}
