import { Component, signal } from '@angular/core';
import { PixelSplitButton, type Option } from '@pxlkit/ui-kit-angular';

const exportOptions: Option[] = [
  { value: 'png', label: 'Export as PNG' },
  { value: 'svg', label: 'Export as SVG' },
  { value: 'json', label: 'Export icon code' },
];

@Component({
  imports: [PixelSplitButton],
  template: `<pxl-split-button label="Export" [options]="exportOptions" (primary)="exportAll()" (selected)="exportAs()" />`,
})
export class Default {
  readonly exportOptions = exportOptions;
  exportAll(): void {}
  exportAs(): void {}
}

@Component({
  imports: [PixelSplitButton],
  template: `
    <div class="flex flex-wrap gap-3">
      <pxl-split-button label="Green" tone="green" [options]="exportOptions" />
      <pxl-split-button label="Cyan" tone="cyan" [options]="exportOptions" />
      <pxl-split-button label="Gold" tone="gold" [options]="exportOptions" />
      <pxl-split-button label="Red" tone="red" [options]="exportOptions" />
      <pxl-split-button label="Purple" tone="purple" [options]="exportOptions" />
      <pxl-split-button label="Pink" tone="pink" [options]="exportOptions" />
      <pxl-split-button label="Neutral" tone="neutral" [options]="exportOptions" />
    </div>
  `,
})
export class Tones {
  readonly exportOptions = exportOptions;
}

@Component({
  imports: [PixelSplitButton],
  template: `
    <div class="flex flex-wrap gap-3">
      <pxl-split-button label="Pixel" surface="pixel" [options]="exportOptions" />
      <pxl-split-button label="Linear" surface="linear" [options]="exportOptions" />
    </div>
  `,
})
export class Surfaces {
  readonly exportOptions = exportOptions;
}

@Component({
  imports: [PixelSplitButton],
  template: `<pxl-split-button label="Export" [options]="exportOptions" disabled />`,
})
export class Disabled {
  readonly exportOptions = exportOptions;
}

@Component({
  imports: [PixelSplitButton],
  template: `
    <div class="flex flex-col items-start gap-2">
      <pxl-split-button
        label="Save"
        tone="cyan"
        [options]="[
          { value: 'draft', label: 'Save as draft' },
          { value: 'template', label: 'Save as template' },
          { value: 'copy', label: 'Save a copy' },
        ]"
        (primary)="last.set('primary')"
        (selected)="last.set($event)"
      />
      <span class="text-xs text-retro-muted">last action: {{ last() }}</span>
    </div>
  `,
})
export class WithCallbacks {
  readonly last = signal('—');
}
