import { Component, signal } from '@angular/core';
import { PixelSlider, type PixelSliderMark } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Volume" [(value)]="value" />`,
})
export class Default {
  readonly value = signal(40);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Price range" [(value)]="value" />`,
})
export class Range {
  readonly value = signal<[number, number]>([20, 80]);
}

@Component({
  imports: [PixelSlider],
  template: `
    <div class="space-y-4">
      <pxl-slider label="Neutral" tone="neutral" [(value)]="neutral" />
      <pxl-slider label="Green" tone="green" [(value)]="green" />
      <pxl-slider label="Cyan" tone="cyan" [(value)]="cyan" />
      <pxl-slider label="Gold" tone="gold" [(value)]="gold" />
      <pxl-slider label="Red" tone="red" [(value)]="red" />
      <pxl-slider label="Purple" tone="purple" [(value)]="purple" />
      <pxl-slider label="Pink" tone="pink" [(value)]="pink" />
    </div>
  `,
})
export class Tones {
  readonly neutral = signal(40);
  readonly green = signal(50);
  readonly cyan = signal(60);
  readonly gold = signal(70);
  readonly red = signal(30);
  readonly purple = signal(45);
  readonly pink = signal(55);
}

@Component({
  imports: [PixelSlider],
  template: `
    <div class="space-y-4">
      <pxl-slider label="Pixel surface" surface="pixel" [(value)]="pixel" />
      <pxl-slider label="Linear surface" surface="linear" [(value)]="linear" />
    </div>
  `,
})
export class Surfaces {
  readonly pixel = signal(40);
  readonly linear = signal(60);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Brightness" [min]="0" [max]="200" [step]="5" showMinMax [(value)]="value" />`,
})
export class WithMinMax {
  readonly value = signal(75);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Quality" [(value)]="value" [marks]="marks" />`,
})
export class WithMarks {
  readonly value = signal(50);
  readonly marks: PixelSliderMark[] = [
    { value: 0, label: 'Low' },
    { value: 25, label: 'Med' },
    { value: 50, label: 'High' },
    { value: 75, label: 'Ultra' },
    { value: 100, label: 'Max' },
  ];
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Step ticks" [min]="0" [max]="100" [step]="10" ticks [(value)]="value" />`,
})
export class WithTicks {
  readonly value = signal(40);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Always tooltip" [(value)]="value" showTooltip="always" />`,
})
export class WithTooltip {
  readonly value = signal(60);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Drag tooltip" [(value)]="value" showTooltip="drag" />`,
})
export class TooltipOnDrag {
  readonly value = signal(35);
}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Disabled" [value]="50" disabled />`,
})
export class Disabled {}

@Component({
  imports: [PixelSlider],
  template: `<pxl-slider label="Required setting" [(value)]="value" required name="setting" />`,
})
export class Required {
  readonly value = signal(30);
}

@Component({
  imports: [PixelSlider],
  template: `
    <pxl-slider label="Filter range" [(value)]="value" showMinMax showTooltip="always" [marks]="marks" />
  `,
})
export class RangeWithMarks {
  readonly value = signal<[number, number]>([30, 70]);
  readonly marks: PixelSliderMark[] = [
    { value: 0, label: '0' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];
}
