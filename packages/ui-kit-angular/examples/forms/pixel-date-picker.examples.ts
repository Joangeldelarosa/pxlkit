import { Component, signal } from '@angular/core';
import { PixelDatePicker } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelDatePicker],
  template: `<pxl-date-picker label="Pick a date" placeholder="Select date" [(value)]="date" />`,
})
export class Default {
  readonly date = signal<Date | null>(null);
}

@Component({
  imports: [PixelDatePicker],
  template: `<pxl-date-picker label="Due date" clearable [presets]="presets" [(value)]="date" />`,
})
export class WithPresets {
  readonly date = signal<Date | null>(null);
  private readonly today = new Date();
  readonly presets = [
    { label: 'Today', value: this.today },
    { label: 'Tomorrow', value: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1) },
    { label: 'Next week', value: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 7) },
  ];
}

@Component({
  imports: [PixelDatePicker],
  template: `
    <pxl-date-picker
      label="Within one month"
      hint="Only the next 30 days are selectable"
      [min]="min"
      [max]="max"
      [(value)]="date"
    />
  `,
})
export class WithMinMax {
  readonly date = signal<Date | null>(null);
  private readonly today = new Date();
  readonly min = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
  readonly max = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate());
}
