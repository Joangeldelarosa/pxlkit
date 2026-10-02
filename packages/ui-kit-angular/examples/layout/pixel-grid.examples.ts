import { Component } from '@angular/core';
import { PixelGrid } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelGrid],
  template: `
    <div pxlGrid [cols]="3" [gap]="4">
      @for (cell of cells; track cell) {
        <div class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">{{ cell }}</div>
      }
    </div>
  `,
})
export class Default {
  readonly cells = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
}

@Component({
  imports: [PixelGrid],
  template: `
    <div pxlGrid [cols]="{ base: 1, sm: 2, md: 3, lg: 4 }" [gap]="4">
      @for (cell of cells; track cell) {
        <div class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">{{ cell }}</div>
      }
    </div>
  `,
})
export class Responsive {
  readonly cells = ['1', '2', '3', '4'];
}

@Component({
  imports: [PixelGrid],
  template: `
    <div pxlGrid autoFit minColWidth="12rem" [gap]="4">
      @for (cell of cells; track cell) {
        <div class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">{{ cell }}</div>
      }
    </div>
  `,
})
export class AutoFit {
  readonly cells = ['Auto A', 'Auto B', 'Auto C', 'Auto D'];
}

@Component({
  imports: [PixelGrid],
  template: `
    <div pxlGrid [cols]="2" [colGap]="8" [rowGap]="2">
      @for (cell of cells; track cell) {
        <div class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">{{ cell }}</div>
      }
    </div>
  `,
})
export class AsymmetricGaps {
  readonly cells = ['A', 'B', 'C', 'D'];
}
