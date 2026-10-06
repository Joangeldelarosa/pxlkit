import { Component } from '@angular/core';
import { PixelCluster } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCluster],
  template: `
    <div pxlCluster>
      @for (tag of tags; track tag) {
        <span class="rounded border border-retro-border px-2 py-1 text-xs text-retro-text">{{ tag }}</span>
      }
    </div>
  `,
})
export class Default {
  readonly tags = ['react', 'typescript', 'tailwind', 'next', 'vite'];
}

@Component({
  imports: [PixelCluster],
  template: `
    <div pxlCluster justify="between" [gap]="6">
      @for (tag of tags; track tag) {
        <span class="rounded border border-retro-border px-2 py-1 text-xs text-retro-text">{{ tag }}</span>
      }
    </div>
  `,
})
export class Justified {
  readonly tags = ['left', 'middle', 'right'];
}

@Component({
  imports: [PixelCluster],
  template: `
    <div pxlCluster surface="pixel" [gap]="3">
      @for (tag of tags; track tag) {
        <span class="rounded border border-retro-border px-2 py-1 text-xs text-retro-text">{{ tag }}</span>
      }
    </div>
  `,
})
export class PixelSurface {
  readonly tags = ['alpha', 'beta', 'gamma'];
}
