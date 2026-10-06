import { Component } from '@angular/core';
import { PixelPortal } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPortal],
  template: `<div *pxlPortal>Portaled content (renders into document.body after mount)</div>`,
})
export class Default {}

@Component({
  imports: [PixelPortal],
  template: `
    <ng-template pxlPortal pxlPortalDisabled>
      <div>Rendered inline — portal disabled</div>
    </ng-template>
  `,
})
export class Disabled {}
