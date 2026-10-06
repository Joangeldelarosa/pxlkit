import { Component, signal } from '@angular/core';
import { PixelPopover, PixelPopoverArrow, PixelPopoverContent, PixelPopoverTrigger } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  template: `
    <pxl-popover [(open)]="open">
      <button type="button" pxlPopoverTrigger>Open popover</button>
      <div *pxlPopoverContent aria-labelledby="popover-title">
        <h3 id="popover-title" class="font-bold mb-1">Popover</h3>
        <p class="text-sm">Floating content anchored to the trigger.</p>
      </div>
    </pxl-popover>
  `,
})
export class Default {
  readonly open = signal(false);
}

@Component({
  imports: [PixelPopover, PixelPopoverTrigger, PixelPopoverContent, PixelPopoverArrow],
  template: `
    <pxl-popover [(open)]="open" side="bottom" align="center">
      <button type="button" pxlPopoverTrigger>With arrow</button>
      <div *pxlPopoverContent aria-labelledby="popover-arrow-title">
        <h3 id="popover-arrow-title" class="font-bold mb-1">Pointed popover</h3>
        <p class="text-sm">Includes a decorative arrow.</p>
        <pxl-popover-arrow />
      </div>
    </pxl-popover>
  `,
})
export class WithArrow {
  readonly open = signal(false);
}

@Component({
  imports: [PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  template: `
    <pxl-popover [(open)]="open" side="right" align="start" [sideOffset]="12">
      <button type="button" pxlPopoverTrigger>Right / start</button>
      <div *pxlPopoverContent aria-labelledby="popover-side-title">
        <h3 id="popover-side-title" class="font-bold mb-1">Side placement</h3>
        <p class="text-sm">Anchored to the right of the trigger.</p>
      </div>
    </pxl-popover>
  `,
})
export class SidePlacement {
  readonly open = signal(false);
}

@Component({
  imports: [PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  template: `
    <pxl-popover [(open)]="open" align="start">
      <button type="button" pxlPopoverTrigger>Rename layer</button>
      <div *pxlPopoverContent aria-labelledby="popover-form-title" class="w-64">
        <h3 id="popover-form-title" class="font-bold mb-2">Rename layer</h3>
        <label for="popover-form-name" class="block text-sm mb-1">Name</label>
        <input
          id="popover-form-name"
          value="Background"
          class="w-full mb-3 px-2 py-1 text-sm bg-retro-surface border border-retro-border text-retro-text"
        />
        <button type="button" (click)="open.set(false)">Save</button>
      </div>
    </pxl-popover>
  `,
})
export class InteractiveContent {
  readonly open = signal(false);
}
