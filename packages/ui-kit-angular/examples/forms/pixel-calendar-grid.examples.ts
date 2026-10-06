import { Component, signal } from '@angular/core';
import { PixelCalendarGrid } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCalendarGrid],
  template: `<pxl-calendar-grid [(value)]="value" />`,
})
export class Default {
  readonly value = signal<Date | null>(null);
}

@Component({
  imports: [PixelCalendarGrid],
  template: `<pxl-calendar-grid [(value)]="value" />`,
})
export class WithSelectedDate {
  readonly value = signal<Date | null>(new Date());
}

@Component({
  imports: [PixelCalendarGrid],
  template: `<pxl-calendar-grid [(value)]="value" [minDate]="min" [maxDate]="max" />`,
})
export class WithMinMax {
  private readonly today = new Date();
  readonly min = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  readonly max = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
  readonly value = signal<Date | null>(null);
}

@Component({
  imports: [PixelCalendarGrid],
  template: `<pxl-calendar-grid [(value)]="value" [disabledDates]="isWeekend" />`,
})
export class WithDisabledWeekends {
  readonly value = signal<Date | null>(null);
  readonly isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
}

@Component({
  imports: [PixelCalendarGrid],
  template: `<pxl-calendar-grid [rangePreview]="{ from, to }" />`,
})
export class RangePreview {
  readonly from = new Date();
  readonly to = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 5);
}
