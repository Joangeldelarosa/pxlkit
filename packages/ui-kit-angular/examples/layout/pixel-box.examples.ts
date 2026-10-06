import { Component } from '@angular/core';
import { PixelBox } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBox],
  template: `
    <div pxlBox tone="neutral" variant="solid" padding="md">
      <p class="text-sm text-retro-muted">Surface-aware container box.</p>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelBox],
  template: `
    <div pxlBox tone="cyan" variant="outline" padding="lg">
      <p class="text-sm text-retro-muted">Outline variant with implicit border.</p>
    </div>
  `,
})
export class Outline {}

@Component({
  imports: [PixelBox],
  template: `
    <div pxlBox tone="purple" variant="soft" padding="md" radius="md">
      <p class="text-sm text-retro-muted">Soft tonal background.</p>
    </div>
  `,
})
export class Soft {}

@Component({
  imports: [PixelBox],
  template: `
    <section pxlBox aria-label="Stats" tone="green" variant="soft" padding="md" shadow>
      <p class="text-sm text-retro-muted">Rendered as a semantic section landmark.</p>
    </section>
  `,
})
export class AsSection {}
