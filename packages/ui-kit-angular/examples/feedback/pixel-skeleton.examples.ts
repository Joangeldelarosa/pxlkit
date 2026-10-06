import { Component } from '@angular/core';
import { PixelSkeleton } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSkeleton],
  template: `<pxl-skeleton width="12rem" height="1rem" />`,
})
export class Default {}

@Component({
  imports: [PixelSkeleton],
  template: `
    <div class="flex flex-col gap-2">
      <pxl-skeleton width="14rem" height="0.75rem" />
      <pxl-skeleton width="11rem" height="0.75rem" />
      <pxl-skeleton width="9rem" height="0.75rem" />
    </div>
  `,
})
export class TextBlock {}

@Component({
  imports: [PixelSkeleton],
  template: `
    <div class="flex items-center gap-3">
      <pxl-skeleton width="2.5rem" height="2.5rem" rounded />
      <div class="flex flex-col gap-1.5">
        <pxl-skeleton width="8rem" height="0.75rem" />
        <pxl-skeleton width="5rem" height="0.75rem" />
      </div>
    </div>
  `,
})
export class Rounded {}

@Component({
  imports: [PixelSkeleton],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-skeleton surface="linear" width="14rem" height="1rem" />
      <pxl-skeleton surface="pixel" width="14rem" height="1rem" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelSkeleton],
  template: `
    <div class="flex w-72 flex-col gap-3 rounded border border-retro-border/60 p-4">
      <pxl-skeleton width="100%" height="8rem" />
      <pxl-skeleton width="80%" height="0.875rem" />
      <pxl-skeleton width="60%" height="0.75rem" />
    </div>
  `,
})
export class CardPlaceholder {}

@Component({
  imports: [PixelSkeleton],
  template: `<pxl-skeleton width="10rem" height="1rem" ariaLabel="Loading user profile" />`,
})
export class CustomLabel {}
