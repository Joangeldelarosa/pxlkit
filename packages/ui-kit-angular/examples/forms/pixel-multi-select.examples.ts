import { Component, signal } from '@angular/core';
import { PixelMultiSelect } from '@pxlkit/ui-kit-angular';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular', disabled: true },
];

@Component({
  imports: [PixelMultiSelect],
  template: `<pxl-multi-select label="Frameworks" [options]="options" placeholder="Pick frameworks…" [(value)]="value" />`,
})
export class Default {
  readonly options = OPTIONS;
  readonly value = signal(['react']);
}

@Component({
  imports: [PixelMultiSelect],
  template: `
    <pxl-multi-select label="Frameworks" hint="Type to filter" [options]="options" searchable clearable [(value)]="value" />
  `,
})
export class Searchable {
  readonly options = OPTIONS;
  readonly value = signal<string[]>([]);
}

@Component({
  imports: [PixelMultiSelect],
  template: `<pxl-multi-select label="Pick up to 2" [options]="options" [max]="2" clearable [(value)]="value" />`,
})
export class WithMax {
  readonly options = OPTIONS;
  readonly value = signal(['react', 'vue']);
}
