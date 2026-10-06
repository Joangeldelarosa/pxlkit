import { Component } from '@angular/core';
import { PixelTypewriter } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTypewriter],
  template: `<pxl-typewriter text="Hello, pxlkit." />`,
})
export class Default {}

@Component({
  imports: [PixelTypewriter],
  template: `<pxl-typewriter text="Typing fast in cyan..." [speed]="30" tone="cyan" />`,
})
export class FastCyan {}

@Component({
  imports: [PixelTypewriter],
  template: `<pxl-typewriter text="No blinking caret here." [cursor]="false" tone="gold" />`,
})
export class NoCursor {}

@Component({
  imports: [PixelTypewriter],
  template: `<pxl-typewriter text="Types when scrolled into view." trigger="inView" tone="purple" />`,
})
export class OnView {}
