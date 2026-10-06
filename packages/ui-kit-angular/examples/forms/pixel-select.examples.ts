import { Component, signal } from '@angular/core';
import { PixelSelect } from '@pxlkit/ui-kit-angular';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

const REGIONS = [
  { value: 'us', label: 'United States' },
  { value: 've', label: 'Venezuela' },
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
];

@Component({
  imports: [PixelSelect],
  template: `<pxl-select label="Fruit" [options]="fruits" placeholder="Pick a fruit" hint="Choose your favorite" />`,
})
export class Default {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelSelect],
  template: `<pxl-select label="Region" [options]="regions" defaultValue="ve" />`,
})
export class Uncontrolled {
  readonly regions = REGIONS;
}

@Component({
  imports: [PixelSelect],
  template: `<pxl-select label="Controlled fruit" [options]="fruits" [(value)]="value" tone="cyan" />`,
})
export class Controlled {
  readonly fruits = FRUITS;
  readonly value = signal('banana');
}

@Component({
  imports: [PixelSelect],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-select label="Neutral" [options]="fruits" tone="neutral" defaultValue="apple" />
      <pxl-select label="Cyan" [options]="fruits" tone="cyan" defaultValue="apple" />
      <pxl-select label="Green" [options]="fruits" tone="green" defaultValue="apple" />
      <pxl-select label="Gold" [options]="fruits" tone="gold" defaultValue="apple" />
      <pxl-select label="Purple" [options]="fruits" tone="purple" defaultValue="apple" />
      <pxl-select label="Pink" [options]="fruits" tone="pink" defaultValue="apple" />
    </div>
  `,
})
export class Tones {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelSelect],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-select label="Small" [options]="fruits" size="sm" placeholder="sm" />
      <pxl-select label="Medium" [options]="fruits" size="md" placeholder="md" />
      <pxl-select label="Large" [options]="fruits" size="lg" placeholder="lg" />
    </div>
  `,
})
export class Sizes {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelSelect],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-select label="Pixel" [options]="fruits" surface="pixel" placeholder="pixel surface" />
      <pxl-select label="Linear" [options]="fruits" surface="linear" placeholder="linear surface" />
    </div>
  `,
})
export class Surfaces {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelSelect],
  template: `<pxl-select label="Disabled" [options]="fruits" defaultValue="apple" disabled />`,
})
export class Disabled {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelSelect],
  template: `
    <pxl-select label="Region" [options]="regions" placeholder="Pick one" error="Please choose a region" tone="red" />
  `,
})
export class WithError {
  readonly regions = REGIONS;
}

@Component({
  imports: [PixelSelect],
  template: `<pxl-select label="Region" [options]="regions" name="region" required placeholder="Required field" />`,
})
export class Required {
  readonly regions = REGIONS;
}

@Component({
  imports: [PixelSelect],
  template: `
    <form>
      <pxl-select
        label="Fruit"
        [options]="fruits"
        name="fruit"
        defaultValue="cherry"
        hint="Value participates in native form submission"
      />
    </form>
  `,
})
export class WithFormName {
  readonly fruits = FRUITS;
}
