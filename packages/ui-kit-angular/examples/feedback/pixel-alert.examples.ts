import { Component } from '@angular/core';
import { PixelAlert, PixelButton } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelAlert],
  template: `<pxl-alert title="Something went wrong" message="Your session expired. Please sign in again to continue." />`,
})
export class Default {}

@Component({
  imports: [PixelAlert],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-alert tone="neutral" title="Heads up" message="Neutral informational banner." />
      <pxl-alert tone="green" title="Saved" message="Your changes have been persisted." />
      <pxl-alert tone="cyan" title="New feature" message="Try the redesigned inbox." />
      <pxl-alert tone="gold" title="Warning" message="Storage is almost full." />
      <pxl-alert tone="red" title="Error" message="Failed to upload the file." />
      <pxl-alert tone="purple" title="Tip" message="Use ⌘K to jump anywhere." />
      <pxl-alert tone="pink" title="Highlight" message="You unlocked a new badge." />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelAlert],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-alert surface="linear" tone="cyan" title="Linear surface" message="Soft border with rounded corners." />
      <pxl-alert surface="pixel" tone="cyan" title="Pixel surface" message="Chamfered border with a left accent stripe." />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelAlert],
  template: `
    <pxl-alert tone="cyan" title="Pro tip" message="You can drag-and-drop files anywhere on the page." [icon]="info" />
    <ng-template #info>
      <span
        aria-hidden="true"
        style="width: 14px; height: 14px; border-radius: 9999px; background: currentColor; display: inline-block"
      ></span>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelAlert, PixelButton],
  template: `
    <pxl-alert
      tone="red"
      title="Connection lost"
      message="We couldn't reach the server. Check your network and retry."
      [icon]="info"
      [action]="retry"
    />
    <ng-template #info>
      <span
        aria-hidden="true"
        style="width: 14px; height: 14px; border-radius: 9999px; background: currentColor; display: inline-block"
      ></span>
    </ng-template>
    <ng-template #retry><button pxlButton size="sm" tone="red" variant="outline">Retry</button></ng-template>
  `,
})
export class WithAction {}

@Component({
  imports: [PixelAlert],
  template: `<pxl-alert tone="green" live="polite" title="Auto-saved" message="Drafts are saved every few seconds." />`,
})
export class PoliteLive {}
