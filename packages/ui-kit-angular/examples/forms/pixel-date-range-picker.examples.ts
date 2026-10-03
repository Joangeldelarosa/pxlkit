import { Component, signal } from '@angular/core';
import { PixelDateRangePicker, type DateRangeValue } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelDateRangePicker],
  template: `<pxl-date-range-picker label="Date range" placeholder="Select date range" [(value)]="range" />`,
})
export class Default {
  readonly range = signal<DateRangeValue>({});
}

@Component({
  imports: [PixelDateRangePicker],
  template: `<pxl-date-range-picker label="Reporting period" clearable [presets]="presets" [(value)]="range" />`,
})
export class WithPresets {
  readonly range = signal<DateRangeValue>({});
  private readonly today = new Date();
  private readonly start = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
  readonly presets = [
    {
      label: 'Last 7 days',
      value: { from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 6), to: this.start },
    },
    {
      label: 'Last 30 days',
      value: { from: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 29), to: this.start },
    },
    {
      label: 'Next 7 days',
      value: { from: this.start, to: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 7) },
    },
  ];
}

@Component({
  imports: [PixelDateRangePicker],
  template: `
    <pxl-date-range-picker
      label="Single-month view"
      hint="Compact one-month calendar"
      [numberOfMonths]="1"
      clearable
      [(value)]="range"
    />
  `,
})
export class SingleMonth {
  readonly range = signal<DateRangeValue>({});
}
