import { Component } from '@angular/core';
import { PixelCenter } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCenter],
  template: `
    <div pxlCenter>
      <p class="text-sm text-retro-muted">
        Centered content with the default max-width and page gutter.
      </p>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelCenter],
  template: `
    <div pxlCenter maxWidth="2xl" text="left">
      <p class="text-sm text-retro-muted">
        A narrower max-width is useful for long-form reading flows where measure matters.
      </p>
    </div>
  `,
})
export class NarrowProse {}

@Component({
  imports: [PixelCenter],
  template: `
    <div pxlCenter maxWidth="3xl" text="center" gutter="md">
      <p class="text-sm text-retro-muted">
        Both the wrapper and the inner text are centered.
      </p>
    </div>
  `,
})
export class TextCentered {}

@Component({
  imports: [PixelCenter],
  template: `
    <section pxlCenter maxWidth="4xl" gutter="lg" surface="pixel">
      <p class="text-sm text-retro-muted">
        Polymorphic: renders as a semantic &lt;section&gt; on the pixel surface.
      </p>
    </section>
  `,
})
export class AsSection {}
