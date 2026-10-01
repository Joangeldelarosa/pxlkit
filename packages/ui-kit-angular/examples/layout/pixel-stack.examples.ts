import { Component } from '@angular/core';
import { PixelStack } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelStack],
  template: `
    <div pxlStack [gap]="4">
      <div class="text-sm text-retro-muted">First item</div>
      <div class="text-sm text-retro-muted">Second item</div>
      <div class="text-sm text-retro-muted">Third item</div>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelStack],
  template: `
    <div pxlStack direction="row" [gap]="3" align="center">
      <div class="text-sm text-retro-muted">Left</div>
      <div class="text-sm text-retro-muted">Center</div>
      <div class="text-sm text-retro-muted">Right</div>
    </div>
  `,
})
export class Row {}

@Component({
  imports: [PixelStack],
  template: `
    <div pxlStack direction="row" justify="between" align="center">
      <div class="text-sm text-retro-muted">Start</div>
      <div class="text-sm text-retro-muted">End</div>
    </div>
  `,
})
export class SpaceBetween {}

@Component({
  imports: [PixelStack],
  template: `
    <div pxlStack direction="row" [gap]="2" wrap>
      <div class="text-sm text-retro-muted">Tag A</div>
      <div class="text-sm text-retro-muted">Tag B</div>
      <div class="text-sm text-retro-muted">Tag C</div>
      <div class="text-sm text-retro-muted">Tag D</div>
    </div>
  `,
})
export class Wrapped {}

@Component({
  imports: [PixelStack],
  template: `
    <div pxlStack surface="pixel" [gap]="4">
      <div class="text-sm text-retro-muted">Surface-aware item</div>
      <div class="text-sm text-retro-muted">Picks up pixel transition</div>
    </div>
  `,
})
export class PixelSurface {}
