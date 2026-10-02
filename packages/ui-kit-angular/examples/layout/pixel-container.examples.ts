import { Component } from '@angular/core';
import { PixelContainer } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelContainer],
  template: `
    <section pxlContainer>
      <p class="text-sm text-retro-muted">Default container — section landmark, xl max-width, lg rhythm.</p>
    </section>
  `,
})
export class Default {}

@Component({
  imports: [PixelContainer],
  template: `
    <section pxlContainer maxWidth="md" padding="md">
      <p class="text-sm text-retro-muted">Narrow container with md rhythm.</p>
    </section>
  `,
})
export class Narrow {}

@Component({
  imports: [PixelContainer],
  template: `
    <main pxlContainer aria-label="Page content" maxWidth="2xl" [padding]="{ x: 'lg', y: 'xl' }">
      <p class="text-sm text-retro-muted">Rendered as the main landmark with split padding.</p>
    </main>
  `,
})
export class AsMain {}

@Component({
  imports: [PixelContainer],
  template: `
    <section pxlContainer maxWidth="prose" padding="sm">
      <p class="text-sm text-retro-muted">Prose-width container ideal for long-form reading.</p>
    </section>
  `,
})
export class ProseWidth {}
