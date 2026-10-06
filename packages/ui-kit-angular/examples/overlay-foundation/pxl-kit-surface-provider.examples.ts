import { Component } from '@angular/core';
import { PixelButton, PxlKitSurfaceProvider } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelButton, PxlKitSurfaceProvider],
  template: `
    <ng-container pxlKitSurface="pixel">
      <div class="flex flex-wrap gap-2">
        <button pxlButton>Pixel</button>
        <button pxlButton variant="outline" tone="cyan">Pixel outline</button>
      </div>
    </ng-container>
  `,
})
export class Default {}

@Component({
  imports: [PixelButton, PxlKitSurfaceProvider],
  template: `
    <ng-container pxlKitSurface="linear">
      <div class="flex flex-wrap gap-2">
        <button pxlButton>Linear</button>
        <button pxlButton variant="outline" tone="cyan">Linear outline</button>
      </div>
    </ng-container>
  `,
})
export class Linear {}

@Component({
  imports: [PixelButton, PxlKitSurfaceProvider],
  template: `
    <ng-container pxlKitSurface="linear">
      <div class="flex flex-wrap gap-2">
        <button pxlButton>From the provider</button>
        <button pxlButton surface="pixel">Own surface prop</button>
      </div>
    </ng-container>
  `,
})
export class Override {}
