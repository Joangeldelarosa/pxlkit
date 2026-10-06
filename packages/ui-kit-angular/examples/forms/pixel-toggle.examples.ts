import { Component, signal } from '@angular/core';
import { PixelToggle } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelToggle],
  template: `<button pxlToggle value="bold" [(pressed)]="pressed">Bold</button>`,
})
export class Default {
  readonly pressed = signal(false);
}

@Component({
  imports: [PixelToggle],
  template: `<button pxlToggle value="italic" [(pressed)]="pressed">Italic</button>`,
})
export class Pressed {
  readonly pressed = signal(true);
}

@Component({
  imports: [PixelToggle],
  template: `
    <div class="flex items-center gap-2">
      <button pxlToggle value="pixel" surface="pixel" [(pressed)]="pixel">Pixel</button>
      <button pxlToggle value="linear" surface="linear" [(pressed)]="linear">Linear</button>
    </div>
  `,
})
export class Surfaces {
  readonly pixel = signal(true);
  readonly linear = signal(true);
}

@Component({
  imports: [PixelToggle],
  template: `
    <div class="flex items-center gap-2">
      <button pxlToggle value="off" disabled [pressed]="false">Disabled off</button>
      <button pxlToggle value="on" disabled [pressed]="true">Disabled on</button>
    </div>
  `,
})
export class Disabled {}
