import { Component, signal } from '@angular/core';
import { PixelAlertDialog } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelAlertDialog],
  template: `
    <div>
      <button type="button" (click)="open.set(true)">Open alert dialog</button>
      <pxl-alert-dialog
        [(open)]="open"
        title="Save changes?"
        description="Your edits will be applied to the live document."
        actionLabel="Save"
        [onAction]="save"
      />
    </div>
  `,
})
export class Default {
  readonly open = signal(false);
  readonly save = () => this.open.set(false);
}

@Component({
  imports: [PixelAlertDialog],
  template: `
    <div>
      <button type="button" (click)="open.set(true)">Delete item</button>
      <pxl-alert-dialog
        [(open)]="open"
        title="Delete this item?"
        description="This action cannot be undone."
        cancelLabel="Keep"
        actionLabel="Delete"
        destructive
        [onAction]="remove"
      />
    </div>
  `,
})
export class Destructive {
  readonly open = signal(false);
  readonly remove = () => this.open.set(false);
}

@Component({
  imports: [PixelAlertDialog],
  template: `
    <div>
      <button type="button" (click)="show()">Submit</button>
      <pxl-alert-dialog
        [(open)]="open"
        title="Submit report?"
        [description]="error() ?? 'The report will be sent for review.'"
        actionLabel="Submit"
        [onAction]="submit"
        [onError]="fail"
      />
    </div>
  `,
})
export class AsyncAction {
  readonly open = signal(false);
  readonly error = signal<string | null>(null);
  readonly submit = () => new Promise<void>((resolve) => setTimeout(resolve, 600));
  readonly fail = (e: unknown) => this.error.set(e instanceof Error ? e.message : 'Failed');

  show(): void {
    this.error.set(null);
    this.open.set(true);
  }
}
