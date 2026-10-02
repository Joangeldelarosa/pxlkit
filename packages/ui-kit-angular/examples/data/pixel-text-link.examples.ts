import { Component } from '@angular/core';
import { PixelTextLink } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTextLink],
  template: `<a pxlTextLink href="https://pxlkit.dev">Read the docs</a>`,
})
export class Default {}

@Component({
  imports: [PixelTextLink],
  template: `
    <div class="flex flex-wrap gap-4">
      <a pxlTextLink href="#" tone="cyan">Cyan link</a>
      <a pxlTextLink href="#" tone="green">Green link</a>
      <a pxlTextLink href="#" tone="gold">Gold link</a>
      <a pxlTextLink href="#" tone="red">Red link</a>
      <a pxlTextLink href="#" tone="purple">Purple link</a>
      <a pxlTextLink href="#" tone="pink">Pink link</a>
      <a pxlTextLink href="#" tone="neutral">Neutral link</a>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelTextLink],
  template: `<button pxlTextLink tone="cyan" (click)="onClick()">Trigger an action</button>`,
})
export class AsButton {
  onClick(): void {
    console.log('clicked');
  }
}

@Component({
  imports: [PixelTextLink],
  template: `
    <div class="flex flex-col gap-3">
      <a pxlTextLink href="#" surface="pixel">Pixel surface</a>
      <a pxlTextLink href="#" surface="linear">Linear surface</a>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelTextLink],
  template: `<a pxlTextLink href="https://pxlkit.dev" target="_blank" rel="noopener noreferrer">Open in new tab</a>`,
})
export class ExternalLink {}

@Component({
  imports: [PixelTextLink],
  template: `
    <p class="max-w-md">
      Built with <a pxlTextLink href="https://pxlkit.dev" tone="green">pxlkit</a>, a tone-coloured component library for
      retro interfaces.
    </p>
  `,
})
export class InlineInProse {}
