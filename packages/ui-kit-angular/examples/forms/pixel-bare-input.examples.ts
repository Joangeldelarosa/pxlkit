import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { PixelBareInput } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput placeholder="Type something" />`,
})
export class Default {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput defaultValue="hello world" aria-label="uncontrolled-input" />`,
})
export class Uncontrolled {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput [(value)]="value" placeholder="Controlled" aria-label="controlled-input" />`,
})
export class Controlled {
  readonly value = signal('');
}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput type="email" placeholder="you@example.com" autocomplete="email" />`,
})
export class Email {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput type="password" placeholder="••••••••" autocomplete="current-password" />`,
})
export class Password {}

@Component({
  imports: [PixelBareInput],
  template: `
    <input pxlBareInput type="number" min="0" max="100" step="1" [defaultValue]="42" aria-label="number-input" />
  `,
})
export class Number {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput defaultValue="not editable" disabled aria-label="disabled-input" />`,
})
export class Disabled {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput defaultValue="read only" readonly aria-label="readonly-input" />`,
})
export class ReadOnly {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput required placeholder="required field" aria-label="required-input" />`,
})
export class Required {}

@Component({
  imports: [PixelBareInput],
  template: `<input pxlBareInput #field placeholder="Focus me via ref" />`,
})
export class WithRef {
  // The directive's host is the native input itself.
  readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
}
