import { Component, signal } from '@angular/core';
import { PixelButton, PixelModal, type Surface } from '@pxlkit/ui-kit-angular';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton (click)="open.set(true)">Open modal</button>
    <pxl-modal [(open)]="open" title="Default modal">
      <p>This is a minimal modal with title and body content.</p>
    </pxl-modal>
  `,
})
export class Default {
  readonly open = signal(false);
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (option of sizes; track option) {
        <button pxlButton size="sm" (click)="size.set(option)">{{ option }}</button>
      }
    </div>
    @if (size(); as current) {
      <pxl-modal [open]="true" [size]="current" [title]="'Size: ' + current" (closed)="size.set(null)">
        <p>Modal rendered at size <code>{{ current }}</code>.</p>
      </pxl-modal>
    }
  `,
})
export class Sizes {
  readonly sizes: ModalSize[] = ['sm', 'md', 'lg', 'xl', 'full'];
  readonly size = signal<ModalSize | null>(null);
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlButton (click)="which.set('pixel')">Pixel surface</button>
      <button pxlButton (click)="which.set('linear')">Linear surface</button>
    </div>
    @if (which(); as surface) {
      <pxl-modal [open]="true" [surface]="surface" [title]="surface + ' surface'" (closed)="which.set(null)">
        <p>The {{ surface }} surface uses surface-aware borders, dividers, and chrome.</p>
      </pxl-modal>
    }
  `,
})
export class Surfaces {
  readonly which = signal<Surface | null>(null);
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton (click)="open.set(true)">Open with description</button>
    <pxl-modal
      [(open)]="open"
      title="Confirm action"
      description="This description is wired via aria-describedby for assistive tech."
    >
      <p>Body content sits below the description.</p>
    </pxl-modal>
  `,
})
export class WithDescription {
  readonly open = signal(false);
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton (click)="open.set(true)">Open with footer</button>
    <pxl-modal [(open)]="open" title="Save changes?" [footer]="actions">
      <p>Footer slot separates actions from body with a surface-aware divider.</p>
    </pxl-modal>
    <ng-template #actions>
      <button pxlButton variant="ghost" (click)="open.set(false)">Cancel</button>
      <button pxlButton tone="cyan" (click)="open.set(false)">Save</button>
    </ng-template>
  `,
})
export class WithFooter {
  readonly open = signal(false);
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton (click)="open.set(true)">Open async-close</button>
    <pxl-modal [(open)]="open" [asyncClose]="asyncClose" title="Persisting…">
      <p>The close button awaits the asyncClose promise before unmounting.</p>
    </pxl-modal>
  `,
})
export class AsyncClose {
  readonly open = signal(false);
  readonly asyncClose = () => new Promise<void>((resolve) => setTimeout(resolve, 800));
}

@Component({
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton (click)="open.set(true)">Open with custom close label</button>
    <pxl-modal [(open)]="open" title="Localized" closeLabel="Cerrar">
      <p>The close button announces a custom accessible label.</p>
    </pxl-modal>
  `,
})
export class CustomCloseLabel {
  readonly open = signal(false);
}
