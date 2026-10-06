import { Component } from '@angular/core';
import { PixelKbd } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelKbd],
  template: `<kbd pxlKbd>Enter</kbd>`,
})
export class Default {}

@Component({
  imports: [PixelKbd],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <kbd pxlKbd>Esc</kbd>
      <kbd pxlKbd>Tab</kbd>
      <kbd pxlKbd>Enter</kbd>
      <kbd pxlKbd>Space</kbd>
      <kbd pxlKbd>Shift</kbd>
    </div>
  `,
})
export class CommonKeys {}

@Component({
  imports: [PixelKbd],
  template: `
    <div class="flex items-center gap-1 text-xs">
      <kbd pxlKbd>Ctrl</kbd>
      <span aria-hidden="true">+</span>
      <kbd pxlKbd>K</kbd>
    </div>
  `,
})
export class Combo {}

@Component({
  imports: [PixelKbd],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <kbd pxlKbd surface="pixel">P</kbd>
      <kbd pxlKbd surface="linear">L</kbd>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelKbd],
  template: `
    <p class="text-sm text-retro-text">
      Press <kbd pxlKbd>/</kbd> to focus the search bar, then <kbd pxlKbd>Esc</kbd> to dismiss it.
    </p>
  `,
})
export class InlineInProse {}
