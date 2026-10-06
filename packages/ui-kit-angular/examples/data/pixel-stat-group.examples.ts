import { Component } from '@angular/core';
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <pxl-stat-group aria-label="Key metrics">
      <pxl-stat-card label="Users" value="1,284" />
      <pxl-stat-card label="Revenue" value="$12.4k" />
      <pxl-stat-card label="Active" value="312" />
    </pxl-stat-group>
  `,
})
export class Default {}

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <pxl-stat-group layout="row" aria-label="Row metrics">
      <pxl-stat-card label="Sessions" value="842" />
      <pxl-stat-card label="Conversions" value="56" />
      <pxl-stat-card label="Bounce" value="24%" />
    </pxl-stat-group>
  `,
})
export class RowLayout {}

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <pxl-stat-group layout="grid" [columns]="4" aria-label="Grid metrics">
      <pxl-stat-card label="A" value="10" />
      <pxl-stat-card label="B" value="20" />
      <pxl-stat-card label="C" value="30" />
      <pxl-stat-card label="D" value="40" />
    </pxl-stat-group>
  `,
})
export class GridLayout {}

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <pxl-stat-group layout="grid" [columns]="3" [gap]="3" aria-label="Spaced grid metrics">
      <pxl-stat-card label="Users" value="1,284" />
      <pxl-stat-card label="Revenue" value="$12.4k" />
      <pxl-stat-card label="Active" value="312" />
    </pxl-stat-group>
  `,
})
export class GridWithGap {}

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-stat-group tone="cyan" aria-label="Cyan group">
        <pxl-stat-card label="Cyan" value="1" tone="cyan" />
        <pxl-stat-card label="Cyan" value="2" tone="cyan" />
      </pxl-stat-group>
      <pxl-stat-group tone="green" aria-label="Green group">
        <pxl-stat-card label="Green" value="1" tone="green" />
        <pxl-stat-card label="Green" value="2" tone="green" />
      </pxl-stat-group>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelStatCard, PixelStatGroup],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-stat-group surface="pixel" aria-label="Pixel surface">
        <pxl-stat-card label="Pixel" value="42" />
        <pxl-stat-card label="Pixel" value="84" />
      </pxl-stat-group>
      <pxl-stat-group surface="linear" aria-label="Linear surface">
        <pxl-stat-card label="Linear" value="42" />
        <pxl-stat-card label="Linear" value="84" />
      </pxl-stat-group>
    </div>
  `,
})
export class Surfaces {}
