import { Component, signal } from '@angular/core';
import { PixelCombobox } from '@pxlkit/ui-kit-angular';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const GROUPED = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 've', label: 'Venezuela', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
];

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Fruit" [options]="fruits" placeholder="Pick a fruit" hint="Type to filter" />`,
})
export class Default {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Fruit" [options]="fruits" defaultValue="banana" />`,
})
export class Uncontrolled {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Controlled fruit" [options]="fruits" [(value)]="value" />`,
})
export class Controlled {
  readonly fruits = FRUITS;
  readonly value = signal('cherry');
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Country" [options]="countries" placeholder="Pick a country" />`,
})
export class Grouped {
  readonly countries = GROUPED;
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Fruit" [options]="fruits" [searchable]="false" placeholder="No filter" />`,
})
export class NotSearchable {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-combobox label="Small" [options]="fruits" size="sm" placeholder="sm" />
      <pxl-combobox label="Medium" [options]="fruits" size="md" placeholder="md" />
      <pxl-combobox label="Large" [options]="fruits" size="lg" placeholder="lg" />
    </div>
  `,
})
export class Sizes {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-combobox label="Pixel" [options]="fruits" surface="pixel" placeholder="pixel surface" />
      <pxl-combobox label="Linear" [options]="fruits" surface="linear" placeholder="linear surface" />
    </div>
  `,
})
export class Surfaces {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Disabled" [options]="fruits" defaultValue="apple" disabled />`,
})
export class Disabled {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `<pxl-combobox label="Fruit" [options]="fruits" placeholder="Pick one" error="Please choose a fruit" />`,
})
export class WithError {
  readonly fruits = FRUITS;
}

@Component({
  imports: [PixelCombobox],
  template: `
    <form>
      <pxl-combobox
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

@Component({
  imports: [PixelCombobox],
  template: `
    <pxl-combobox label="Fruit" [options]="fruits" placeholder="Type 'xyz'" emptyMessage="No fruits match your filter" />
  `,
})
export class CustomEmptyMessage {
  readonly fruits = FRUITS;
}
