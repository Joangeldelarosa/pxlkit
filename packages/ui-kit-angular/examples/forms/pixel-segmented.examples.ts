import { Component, signal } from '@angular/core';
import { PixelSegmented } from '@pxlkit/ui-kit-angular';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];

@Component({
  imports: [PixelSegmented],
  template: `<pxl-segmented label="View" [options]="views" [(value)]="value" />`,
})
export class Default {
  readonly views = VIEWS;
  readonly value = signal('grid');
}

@Component({
  imports: [PixelSegmented],
  template: `
    <div class="space-y-2">
      <pxl-segmented label="Active view" [options]="views" [(value)]="value" tone="cyan" />
      <p class="text-xs text-retro-muted">Picked: {{ value() }}</p>
    </div>
  `,
})
export class Controlled {
  readonly views = VIEWS;
  readonly value = signal('list');
}

@Component({
  imports: [PixelSegmented],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <pxl-segmented label="Neutral" tone="neutral" [options]="views" [(value)]="value" />
      <pxl-segmented label="Green" tone="green" [options]="views" [(value)]="value" />
      <pxl-segmented label="Cyan" tone="cyan" [options]="views" [(value)]="value" />
      <pxl-segmented label="Gold" tone="gold" [options]="views" [(value)]="value" />
      <pxl-segmented label="Red" tone="red" [options]="views" [(value)]="value" />
      <pxl-segmented label="Purple" tone="purple" [options]="views" [(value)]="value" />
      <pxl-segmented label="Pink" tone="pink" [options]="views" [(value)]="value" />
    </div>
  `,
})
export class Tones {
  readonly views = VIEWS;
  readonly value = signal('grid');
}

@Component({
  imports: [PixelSegmented],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <pxl-segmented label="Pixel surface" surface="pixel" [options]="views" [(value)]="pixel" />
      <pxl-segmented label="Linear surface" surface="linear" [options]="views" [(value)]="linear" />
    </div>
  `,
})
export class Surfaces {
  readonly views = VIEWS;
  readonly pixel = signal('grid');
  readonly linear = signal('grid');
}

@Component({
  imports: [PixelSegmented],
  template: `<pxl-segmented label="View (locked)" value="grid" [options]="views" disabled />`,
})
export class Disabled {
  readonly views = VIEWS;
}

@Component({
  imports: [PixelSegmented],
  template: `<pxl-segmented label="Choose a view" [options]="views" [(value)]="value" required />`,
})
export class Required {
  readonly views = VIEWS;
  readonly value = signal('grid');
}

@Component({
  imports: [PixelSegmented],
  template: `
    <form>
      <pxl-segmented label="View" name="view" [options]="views" [(value)]="value" required />
    </form>
  `,
})
export class WithFormName {
  readonly views = VIEWS;
  readonly value = signal('grid');
}
