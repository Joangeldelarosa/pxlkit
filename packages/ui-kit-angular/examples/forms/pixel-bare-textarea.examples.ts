import { Component, signal } from '@angular/core';
import { PixelBareTextarea } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBareTextarea],
  template: `<textarea pxlBareTextarea placeholder="Write something..." rows="4"></textarea>`,
})
export class Default {}

@Component({
  imports: [PixelBareTextarea],
  template: `<textarea pxlBareTextarea defaultValue="Initial draft text" rows="4" aria-label="Notes"></textarea>`,
})
export class Uncontrolled {}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <div class="flex flex-col gap-2">
      <textarea
        pxlBareTextarea
        [(value)]="value"
        placeholder="Type to see live updates"
        rows="4"
        aria-label="Message"
      ></textarea>
      <span class="text-xs text-retro-muted">{{ value().length }} chars</span>
    </div>
  `,
})
export class Controlled {
  readonly value = signal('');
}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <textarea pxlBareTextarea disabled defaultValue="Cannot edit this field" rows="3" aria-label="Disabled textarea"></textarea>
  `,
})
export class Disabled {}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <textarea
      pxlBareTextarea
      readonly
      defaultValue="Read-only content for reference"
      rows="3"
      aria-label="Read-only textarea"
    ></textarea>
  `,
})
export class ReadOnly {}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <textarea
      pxlBareTextarea
      class="w-full rounded border border-retro-line bg-retro-elev p-3 font-mono text-sm text-retro-text"
      placeholder="Escape-hatch: bring your own styles"
      rows="5"
      aria-label="Custom styled textarea"
    ></textarea>
  `,
})
export class WithCustomStyling {}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <textarea pxlBareTextarea maxlength="140" placeholder="Up to 140 characters" rows="3" aria-label="Short bio"></textarea>
  `,
})
export class WithMaxLength {}

@Component({
  imports: [PixelBareTextarea],
  template: `
    <textarea
      pxlBareTextarea
      required
      placeholder="This field is required"
      rows="3"
      aria-label="Required textarea"
      aria-required="true"
    ></textarea>
  `,
})
export class Required {}
