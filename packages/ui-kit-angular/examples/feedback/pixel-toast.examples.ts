import { Component } from '@angular/core';
import { PixelButton, PixelToast, type ToastItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelToast],
  template: `<pxl-toast-card [toast]="toast" />`,
})
export class Default {
  readonly toast: ToastItem = {
    id: 'demo',
    title: 'Saved',
    message: 'Your changes have been persisted.',
    tone: 'cyan',
    duration: 0,
  };
}

@Component({
  imports: [PixelToast],
  template: `
    <div class="flex flex-col gap-3">
      @for (toast of toasts; track toast.id) {
        <pxl-toast-card [toast]="toast" />
      }
    </div>
  `,
})
export class Tones {
  readonly toasts: ToastItem[] = [
    { id: 't-neutral', tone: 'neutral', title: 'Heads up', message: 'Neutral notification.', duration: 0 },
    { id: 't-green', tone: 'green', title: 'Saved', message: 'Changes synced.', duration: 0 },
    { id: 't-cyan', tone: 'cyan', title: 'Info', message: 'Heads up — new build available.', duration: 0 },
    { id: 't-gold', tone: 'gold', title: 'Warning', message: 'Storage almost full.', duration: 0 },
    { id: 't-red', tone: 'red', title: 'Error', message: 'Upload failed.', duration: 0 },
    { id: 't-purple', tone: 'purple', title: 'Tip', message: 'Press ⌘K to search.', duration: 0 },
    { id: 't-pink', tone: 'pink', title: 'Unlocked', message: 'You earned a badge.', duration: 0 },
  ];
}

@Component({
  imports: [PixelToast],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-toast-card
        surface="linear"
        [toast]="{ id: 't-linear', tone: 'cyan', title: 'Linear surface', message: 'Rounded card.', duration: 0 }"
      />
      <pxl-toast-card
        surface="pixel"
        [toast]="{ id: 't-pixel', tone: 'cyan', title: 'Pixel surface', message: 'Chamfered + HP bar.', duration: 0 }"
      />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelToast],
  template: `<pxl-toast-card [toast]="toast" />`,
})
export class Loading {
  readonly toast: ToastItem = {
    id: 't-loading',
    tone: 'cyan',
    title: 'Uploading…',
    message: 'Hang tight while we sync your files.',
    loading: true,
    duration: 0,
  };
}

@Component({
  imports: [PixelButton, PixelToast],
  template: `
    <pxl-toast-card
      [toast]="{
        id: 't-action',
        tone: 'red',
        title: 'Connection lost',
        message: 'We could not reach the server.',
        duration: 0,
        action: retry,
      }"
    />
    <ng-template #retry><button pxlButton size="sm" tone="red" variant="outline">Retry</button></ng-template>
  `,
})
export class WithAction {}

@Component({
  imports: [PixelToast],
  template: `
    <pxl-toast-card
      [toast]="{ id: 't-icon', tone: 'green', title: 'Deployed', message: 'Build #482 is live.', duration: 0, icon: dot }"
    />
    <ng-template #dot>
      <span
        aria-hidden="true"
        style="width: 10px; height: 10px; border-radius: 9999px; background: currentColor; display: inline-block"
      ></span>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelToast],
  template: `<pxl-toast-card [toast]="toast" />`,
})
export class Assertive {
  readonly toast: ToastItem = {
    id: 't-assertive',
    tone: 'cyan',
    title: 'Important',
    message: 'Forced assertive announcement.',
    assertive: true,
    duration: 0,
  };
}

@Component({
  imports: [PixelToast],
  template: `<pxl-toast-card [toast]="toast" />`,
})
export class WithProgress {
  readonly toast: ToastItem = {
    id: 't-progress',
    tone: 'green',
    title: 'Auto-dismiss',
    message: 'Hover to pause the countdown bar.',
    duration: 4500,
  };
}
