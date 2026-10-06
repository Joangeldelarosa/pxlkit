import { Component, signal } from '@angular/core';
import { PixelTextarea } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTextarea],
  template: `<pxl-textarea label="Notes" placeholder="Write something..." hint="Up to 280 characters." />`,
})
export class Default {}

@Component({
  imports: [PixelTextarea],
  template: `<pxl-textarea label="Bio" defaultValue="Frontend engineer focused on retro UIs." hint="Edit freely." />`,
})
export class Uncontrolled {}

@Component({
  imports: [PixelTextarea],
  template: `
    <pxl-textarea
      label="Message"
      [(value)]="value"
      placeholder="Type to see live updates..."
      [hint]="value().length + ' chars'"
    />
  `,
})
export class Controlled {
  readonly value = signal('');
}

@Component({
  imports: [PixelTextarea],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-textarea label="Neutral" tone="neutral" defaultValue="Neutral tone" />
      <pxl-textarea label="Green" tone="green" defaultValue="Green tone" />
      <pxl-textarea label="Cyan" tone="cyan" defaultValue="Cyan tone" />
      <pxl-textarea label="Gold" tone="gold" defaultValue="Gold tone" />
      <pxl-textarea label="Red" tone="red" defaultValue="Red tone" />
      <pxl-textarea label="Purple" tone="purple" defaultValue="Purple tone" />
      <pxl-textarea label="Pink" tone="pink" defaultValue="Pink tone" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelTextarea],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-textarea label="Pixel surface" surface="pixel" defaultValue="Chunky pixel chrome" />
      <pxl-textarea label="Linear surface" surface="linear" defaultValue="Sleek linear chrome" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelTextarea],
  template: `
    <pxl-textarea
      label="Feedback"
      defaultValue=""
      error="Feedback is required."
      placeholder="Tell us what went wrong..."
    />
  `,
})
export class WithError {}

@Component({
  imports: [PixelTextarea],
  template: `<pxl-textarea label="Locked notes" disabled defaultValue="Cannot edit this field" />`,
})
export class Disabled {}

@Component({
  imports: [PixelTextarea],
  template: `<pxl-textarea label="Auto-grow" autosize [minRows]="2" [maxRows]="8" [(value)]="value" />`,
})
export class Autosize {
  readonly value = signal('Type more lines to watch this grow.\nIt will expand between minRows and maxRows.');
}

@Component({
  imports: [PixelTextarea],
  template: `
    <pxl-textarea label="Short bio" [(value)]="value" [showCount]="{ max: 140 }" placeholder="Up to 140 characters" />
  `,
})
export class WithCharCount {
  readonly value = signal('Short blurb');
}

@Component({
  imports: [PixelTextarea],
  template: `<pxl-textarea label="Required" required placeholder="This field is required" hint="Don't leave it blank." />`,
})
export class Required {}
