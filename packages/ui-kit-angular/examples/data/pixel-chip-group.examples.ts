import { Component, signal } from '@angular/core';
import { PixelChip, PixelChipGroup, PixelChipGroupItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelChip, PixelChipGroup, PixelChipGroupItem],
  template: `
    <pxl-chip-group [(value)]="value" aria-label="Frameworks">
      <pxl-chip *pxlChipGroupItem="'react'" label="React" tone="cyan" />
      <pxl-chip *pxlChipGroupItem="'vue'" label="Vue" tone="green" />
      <pxl-chip *pxlChipGroupItem="'svelte'" label="Svelte" tone="gold" />
    </pxl-chip-group>
  `,
})
export class Default {
  readonly value = signal(['react']);
}

@Component({
  imports: [PixelChip, PixelChipGroup, PixelChipGroupItem],
  template: `
    <pxl-chip-group [(value)]="value" multiple aria-label="Languages">
      <pxl-chip *pxlChipGroupItem="'ts'" label="TypeScript" tone="cyan" />
      <pxl-chip *pxlChipGroupItem="'rust'" label="Rust" tone="gold" />
      <pxl-chip *pxlChipGroupItem="'go'" label="Go" tone="green" />
      <pxl-chip *pxlChipGroupItem="'py'" label="Python" tone="purple" />
    </pxl-chip-group>
  `,
})
export class MultiSelect {
  readonly value = signal(['ts', 'rust']);
}

@Component({
  imports: [PixelChip, PixelChipGroup, PixelChipGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-chip-group [(value)]="a" surface="pixel" aria-label="Pixel surface">
        <pxl-chip *pxlChipGroupItem="'one'" label="One" tone="green" />
        <pxl-chip *pxlChipGroupItem="'two'" label="Two" tone="green" />
      </pxl-chip-group>
      <pxl-chip-group [(value)]="b" surface="linear" aria-label="Linear surface">
        <pxl-chip *pxlChipGroupItem="'one'" label="One" tone="cyan" />
        <pxl-chip *pxlChipGroupItem="'two'" label="Two" tone="cyan" />
      </pxl-chip-group>
    </div>
  `,
})
export class Surfaces {
  readonly a = signal(['one']);
  readonly b = signal(['one']);
}
