import { Component, signal } from '@angular/core';
import { PixelBareButton } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBareButton],
  template: `<button pxlBareButton>Bare button</button>`,
})
export class Default {}

@Component({
  imports: [PixelBareButton],
  template: `
    <button
      pxlBareButton
      class="rounded-md border border-retro-border bg-retro-surface px-3 py-1 text-sm text-retro-text"
    >
      Styled by consumer
    </button>
  `,
})
export class WithCustomClass {}

@Component({
  imports: [PixelBareButton],
  template: `<button pxlBareButton disabled class="cursor-not-allowed opacity-50">Disabled</button>`,
})
export class Disabled {}

@Component({
  imports: [PixelBareButton],
  template: `<button pxlBareButton (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>`,
})
export class WithOnClick {
  readonly count = signal(0);
}

@Component({
  imports: [PixelBareButton],
  template: `
    <form class="flex gap-2" (submit)="$event.preventDefault()">
      <button pxlBareButton type="submit">Submit</button>
      <button pxlBareButton type="reset">Reset</button>
    </form>
  `,
})
export class SubmitType {}

@Component({
  imports: [PixelBareButton],
  template: `
    <button
      pxlBareButton
      aria-label="Close"
      class="inline-flex h-6 w-6 items-center justify-center text-retro-muted hover:text-retro-text"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  `,
})
export class AsIconTrigger {}
