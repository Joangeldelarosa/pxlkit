import { Component } from '@angular/core';
import { PixelEqualHeightGrid } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelEqualHeightGrid],
  template: `
    <div pxlEqualHeightGrid [cols]="{ base: 1, sm: 3 }" [gap]="4">
      @for (card of cards; track card.title) {
        <div class="border border-retro-border p-4">
          <h3 class="text-sm font-semibold text-retro-text">{{ card.title }}</h3>
          <p class="text-sm text-retro-muted">{{ card.body }}</p>
          <div class="mt-2 text-xs text-retro-muted">Footer</div>
        </div>
      }
    </div>
  `,
})
export class Default {
  readonly cards = [
    { title: 'One', body: 'Short copy.' },
    { title: 'Two', body: 'A longer body that forces the row to grow taller than the first card.' },
    { title: 'Three', body: 'Medium length copy here.' },
  ];
}

@Component({
  imports: [PixelEqualHeightGrid],
  template: `
    <div pxlEqualHeightGrid [cols]="{ base: 1, sm: 3 }" [gap]="4" rowAlign="top">
      @for (card of cards; track card.title) {
        <div class="border border-retro-border p-4">
          <h3 class="text-sm font-semibold text-retro-text">{{ card.title }}</h3>
          <p class="text-sm text-retro-muted">{{ card.body }}</p>
          <div class="mt-2 text-xs text-retro-muted">Footer</div>
        </div>
      }
    </div>
  `,
})
export class RowAlignTop {
  readonly cards = [
    { title: 'One', body: 'Short copy.' },
    { title: 'Two', body: 'A longer body that would otherwise stretch siblings.' },
    { title: 'Three', body: 'Medium length copy here.' },
  ];
}

@Component({
  imports: [PixelEqualHeightGrid],
  template: `
    <div pxlEqualHeightGrid [cols]="2" [gap]="4" surface="pixel">
      @for (card of cards; track card.title) {
        <div class="border border-retro-border p-4">
          <h3 class="text-sm font-semibold text-retro-text">{{ card.title }}</h3>
          <p class="text-sm text-retro-muted">{{ card.body }}</p>
          <div class="mt-2 text-xs text-retro-muted">Footer</div>
        </div>
      }
    </div>
  `,
})
export class PixelSurface {
  readonly cards = [
    { title: 'Pixel A', body: 'Surface-aware grid item.' },
    { title: 'Pixel B', body: 'Renders with the pixel surface tokens applied to the grid.' },
  ];
}
