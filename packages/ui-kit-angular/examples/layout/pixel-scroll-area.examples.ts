import { Component } from '@angular/core';
import { PixelScrollArea } from '@pxlkit/ui-kit-angular';

/** `[1, 2, …, count]`. */
const upTo = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

@Component({
  imports: [PixelScrollArea],
  template: `
    <pxl-scroll-area aria-label="Sample scrollable region" [maxHeight]="160">
      <div class="space-y-2 p-3">
        @for (i of items; track i) {
          <p class="text-sm text-retro-muted">Scroll item {{ i }}</p>
        }
      </div>
    </pxl-scroll-area>
  `,
})
export class Default {
  readonly items = upTo(12);
}

@Component({
  imports: [PixelScrollArea],
  template: `
    <pxl-scroll-area aria-label="Always-visible scrollbar" type="always" [maxHeight]="140" offsetScrollbars>
      <div class="space-y-2 p-3">
        @for (i of items; track i) {
          <p class="text-sm text-retro-muted">Row {{ i }}</p>
        }
      </div>
    </pxl-scroll-area>
  `,
})
export class AlwaysVisible {
  readonly items = upTo(10);
}

@Component({
  imports: [PixelScrollArea],
  template: `
    <pxl-scroll-area aria-label="Custom scrollbar size" type="hover" [maxHeight]="140" [scrollbarSize]="10">
      <div class="space-y-2 p-3">
        @for (i of items; track i) {
          <p class="text-sm text-retro-muted">Hover row {{ i }}</p>
        }
      </div>
    </pxl-scroll-area>
  `,
})
export class CustomScrollbarSize {
  readonly items = upTo(10);
}
