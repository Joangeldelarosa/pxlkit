import { Component } from '@angular/core';
import { PixelSection } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSection],
  template: `
    <pxl-section title="Overview" subtitle="Key metrics for this period.">
      <p class="text-sm text-retro-muted">
        Section content goes here. Wrap any layout block.
      </p>
    </pxl-section>
  `,
})
export class Default {}

@Component({
  imports: [PixelSection],
  template: `
    <pxl-section>
      <p class="text-sm text-retro-muted">A bare section without a title row.</p>
    </pxl-section>
  `,
})
export class WithoutTitle {}

@Component({
  imports: [PixelSection],
  template: `
    <pxl-section surface="pixel" title="Pixel Surface" subtitle="8-bit aesthetic.">
      <p class="text-sm text-retro-muted">Renders with the pixel surface tokens.</p>
    </pxl-section>
  `,
})
export class PixelSurface {}

@Component({
  imports: [PixelSection],
  template: `
    <pxl-section [container]="false" horizontalGutter="md" title="Full Width">
      <p class="text-sm text-retro-muted">No centered container; uses page gutters.</p>
    </pxl-section>
  `,
})
export class NoContainer {}
