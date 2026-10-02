import { Component } from '@angular/core';
import { PixelButton, PxlKitToastProvider, type ToastApi } from '@pxlkit/ui-kit-angular';

type ToastFn = ToastApi['toast'];

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster>
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="toaster.toast({ title: 'Saved', message: 'Your changes were persisted.' })">
          Push toast
        </button>
      </div>
    </pxl-toast-provider>
  `,
})
export class Default {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster>
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" tone="green" (click)="toaster.toast.success('Saved', 'Changes persisted.')">Success</button>
        <button pxlButton size="sm" tone="cyan" (click)="toaster.toast.info('Heads up', 'New release available.')">Info</button>
        <button pxlButton size="sm" tone="gold" (click)="toaster.toast.warning('Careful', 'Storage almost full.')">Warning</button>
        <button pxlButton size="sm" tone="red" (click)="toaster.toast.error('Failed', 'Upload could not finish.')">Error</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class Tones {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster position="bottom-right">
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="toaster.toast({ title: 'Bottom-right toast' })">Push to bottom-right</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class BottomRight {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster position="top-center">
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="toaster.toast({ title: 'Bottom-right toast' })">Push to bottom-right</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class TopCenter {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster stacked [stackVisible]="2">
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="pushThree(toaster.toast)">Push three</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class Stacked {
  pushThree(toast: ToastFn): void {
    toast({ title: 'First', message: 'Oldest of the stack.' });
    toast({ title: 'Second', message: 'In the middle.' });
    toast({ title: 'Third', message: 'Newest in front.' });
  }
}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster [stacked]="false">
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="pushThree(toaster.toast)">Push three</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class Flat {
  pushThree(toast: ToastFn): void {
    toast({ title: 'First', message: 'Oldest of the stack.' });
    toast({ title: 'Second', message: 'In the middle.' });
    toast({ title: 'Third', message: 'Newest in front.' });
  }
}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster surface="pixel">
      <div class="flex flex-wrap gap-2">
        <button
          pxlButton
          size="sm"
          (click)="toaster.toast({ title: 'Pixel surface', message: 'HP-bar accent on the left edge.', tone: 'cyan' })"
        >
          Push pixel toast
        </button>
      </div>
    </pxl-toast-provider>
  `,
})
export class PixelSurface {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster surface="linear">
      <div class="flex flex-wrap gap-2">
        <button
          pxlButton
          size="sm"
          (click)="toaster.toast({ title: 'Pixel surface', message: 'HP-bar accent on the left edge.', tone: 'cyan' })"
        >
          Push pixel toast
        </button>
      </div>
    </pxl-toast-provider>
  `,
})
export class LinearSurface {}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster>
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="runUpload(toaster.toast)">Run loading → success</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class Loading {
  runUpload(toast: ToastFn): void {
    const id = toast.loading('Uploading…', 'Hang tight.');
    setTimeout(() => {
      toast.update(id, {
        title: 'Uploaded',
        message: 'File is ready.',
        tone: 'green',
        loading: false,
        duration: 4500,
      });
    }, 1000);
  }
}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster>
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="runSave(toaster.toast)">Run promise</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class PromiseFlow {
  runSave(toast: ToastFn): Promise<string> {
    return toast.promise(() => new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 1000)), {
      loading: { title: 'Saving…' },
      success: { title: 'Saved', message: 'All set.' },
      error: { title: 'Failed', message: 'Try again.' },
    });
  }
}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster [max]="2">
      <div class="flex flex-wrap gap-2">
        <button pxlButton size="sm" (click)="pushFive(toaster.toast)">Push five (max 2)</button>
      </div>
    </pxl-toast-provider>
  `,
})
export class MaxLimit {
  pushFive(toast: ToastFn): void {
    for (let i = 1; i <= 5; i += 1) {
      toast({ title: `Toast ${i}`, message: 'Only the latest two stay.' });
    }
  }
}

@Component({
  imports: [PixelButton, PxlKitToastProvider],
  template: `
    <pxl-toast-provider #toaster>
      <div class="flex flex-wrap gap-2">
        <button
          pxlButton
          size="sm"
          tone="red"
          (click)="toaster.toast({ tone: 'red', title: 'File deleted', message: 'You can still restore it.', action: undo })"
        >
          Push with action
        </button>
      </div>
    </pxl-toast-provider>
    <ng-template #undo><button pxlButton size="sm" tone="red" variant="outline">Undo</button></ng-template>
  `,
})
export class WithAction {}
