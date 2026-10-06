import { Component, signal } from '@angular/core';
import { PixelDrawer, PixelDrawerBody, PixelDrawerFooter, PixelDrawerHeader } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelDrawer, PixelDrawerHeader, PixelDrawerBody, PixelDrawerFooter],
  template: `
    <button type="button" (click)="open.set(true)">Open drawer</button>
    <pxl-drawer [(open)]="open" title="Settings">
      <pxl-drawer-header>
        <span>Settings</span>
        <button type="button" (click)="open.set(false)">Close</button>
      </pxl-drawer-header>
      <pxl-drawer-body>
        <p>Drawer content goes here.</p>
      </pxl-drawer-body>
      <pxl-drawer-footer>
        <button type="button" (click)="open.set(false)">Done</button>
      </pxl-drawer-footer>
    </pxl-drawer>
  `,
})
export class Default {
  readonly open = signal(false);
}

@Component({
  imports: [PixelDrawer, PixelDrawerHeader, PixelDrawerBody],
  template: `
    <button type="button" (click)="open.set(true)">Open left drawer</button>
    <pxl-drawer [(open)]="open" side="left" size="lg" title="Navigation">
      <pxl-drawer-header>Navigation</pxl-drawer-header>
      <pxl-drawer-body>
        <p>Menu items here.</p>
      </pxl-drawer-body>
    </pxl-drawer>
  `,
})
export class LeftSide {
  readonly open = signal(false);
}

@Component({
  imports: [PixelDrawer, PixelDrawerBody, PixelDrawerFooter],
  template: `
    <button type="button" (click)="open.set(true)">Open bottom sheet</button>
    <pxl-drawer [(open)]="open" side="bottom" size="md" title="Quick actions" description="Pick an action below">
      <pxl-drawer-body>
        <p>Sheet content.</p>
      </pxl-drawer-body>
      <pxl-drawer-footer>
        <button type="button" (click)="open.set(false)">Cancel</button>
      </pxl-drawer-footer>
    </pxl-drawer>
  `,
})
export class BottomSheet {
  readonly open = signal(false);
}
