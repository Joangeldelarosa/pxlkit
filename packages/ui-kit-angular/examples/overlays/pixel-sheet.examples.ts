import { Component, signal } from '@angular/core';
import { PixelSheet } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSheet],
  template: `
    <button type="button" (click)="open.set(true)">Open sheet</button>
    <pxl-sheet [(open)]="open" title="Quick actions" description="Pick an action below">
      <p>Sheet content goes here.</p>
      <button type="button" (click)="open.set(false)">Close</button>
    </pxl-sheet>
  `,
})
export class Default {
  readonly open = signal(false);
}

@Component({
  imports: [PixelSheet],
  template: `
    <button type="button" (click)="open.set(true)">Open sheet</button>
    <pxl-sheet [(open)]="open" size="lg" dragHandle title="Drag handle">
      <p>Bottom sheet with a drag handle affordance.</p>
    </pxl-sheet>
  `,
})
export class WithDragHandle {
  readonly open = signal(false);
}

@Component({
  imports: [PixelSheet],
  template: `
    <button type="button" (click)="open.set(true)">Open top sheet</button>
    <pxl-sheet [(open)]="open" side="top" size="full" ariaLabel="Top full-screen sheet">
      <p>Top-anchored full-height sheet.</p>
      <button type="button" (click)="open.set(false)">Close</button>
    </pxl-sheet>
  `,
})
export class TopFull {
  readonly open = signal(false);
}
