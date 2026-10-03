import { Component, signal } from '@angular/core';
import { PixelFileUpload } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelFileUpload],
  template: `
    <pxl-file-upload
      label="Upload files"
      hint="PNG or JPG, up to 5 MB each"
      [(value)]="files"
      accept="image/*"
      multiple
      [maxSize]="5 * 1024 * 1024"
      [maxFiles]="5"
    />
  `,
})
export class Default {
  readonly files = signal<File[]>([]);
}

@Component({
  imports: [PixelFileUpload],
  template: `<pxl-file-upload label="Choose a file" [(value)]="files" [dropzone]="false" />`,
})
export class ButtonMode {
  readonly files = signal<File[]>([]);
}

@Component({
  imports: [PixelFileUpload],
  template: `<pxl-file-upload label="Attachments" error="At least one file is required" accept=".pdf,.doc,.docx" />`,
})
export class WithError {}
