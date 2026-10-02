import { Component, signal } from '@angular/core';
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <pxl-tooltip label="Save your changes">
      <button pxlButton>Save</button>
    </pxl-tooltip>
  `,
})
export class Default {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <pxl-tooltip label="Top tooltip" position="top">
        <button pxlButton>Top</button>
      </pxl-tooltip>
      <pxl-tooltip label="Bottom tooltip" position="bottom">
        <button pxlButton>Bottom</button>
      </pxl-tooltip>
      <pxl-tooltip label="Left tooltip" position="left">
        <button pxlButton>Left</button>
      </pxl-tooltip>
      <pxl-tooltip label="Right tooltip" position="right">
        <button pxlButton>Right</button>
      </pxl-tooltip>
    </div>
  `,
})
export class Positions {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <pxl-tooltip label="Opens on hover or focus" trigger="hover">
        <button pxlButton>Hover</button>
      </pxl-tooltip>
      <pxl-tooltip label="Opens on focus only" trigger="focus">
        <button pxlButton>Focus</button>
      </pxl-tooltip>
      <pxl-tooltip label="Click to toggle, Escape to close" trigger="click">
        <button pxlButton>Click</button>
      </pxl-tooltip>
    </div>
  `,
})
export class Triggers {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <pxl-tooltip label="Pixel surface" surface="pixel">
        <button pxlButton surface="pixel">Pixel</button>
      </pxl-tooltip>
      <pxl-tooltip label="Linear surface" surface="linear">
        <button pxlButton surface="linear">Linear</button>
      </pxl-tooltip>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <pxl-tooltip [content]="details">
      <button pxlButton>Hover for details</button>
    </pxl-tooltip>
    <ng-template #details>
      <span class="flex flex-col gap-0.5">
        <span class="font-semibold">Keyboard shortcut</span>
        <span class="opacity-80">Press ⌘K to open the command palette</span>
      </span>
    </ng-template>
  `,
})
export class RichContent {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <pxl-tooltip label="Opens instantly" [delay]="{ open: 0, close: 0 }">
        <button pxlButton>Instant</button>
      </pxl-tooltip>
      <pxl-tooltip label="Slow open, fast close" [delay]="{ open: 600, close: 0 }">
        <button pxlButton>Slow open</button>
      </pxl-tooltip>
    </div>
  `,
})
export class CustomDelay {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex items-center gap-4">
      <pxl-tooltip [(open)]="open" label="Controlled tooltip">
        <button pxlButton>Anchor</button>
      </pxl-tooltip>
      <button pxlButton tone="cyan" variant="outline" (click)="open.set(!open())">{{ open() ? 'Hide' : 'Show' }}</button>
    </div>
  `,
})
export class Controlled {
  readonly open = signal(false);
}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <pxl-tooltip defaultOpen label="Open by default" trigger="click">
      <button pxlButton>Click to toggle</button>
    </pxl-tooltip>
  `,
})
export class Uncontrolled {}

@Component({
  imports: [PixelButton, PixelTooltip],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <pxl-tooltip label="Tight (2px)" [sideOffset]="2">
        <button pxlButton>Tight</button>
      </pxl-tooltip>
      <pxl-tooltip label="Roomy (16px)" [sideOffset]="16">
        <button pxlButton>Roomy</button>
      </pxl-tooltip>
    </div>
  `,
})
export class SideOffset {}
