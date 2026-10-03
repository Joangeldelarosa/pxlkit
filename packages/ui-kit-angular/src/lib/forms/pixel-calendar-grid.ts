import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  monthOf,
  rangeSpan,
  startOfDay,
  type CalendarRangePreview,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectPxlKitLocale } from '../overlay-foundation/pxl-kit-locale-provider';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Standalone month grid for picking a day, inline or composed into a
 * picker: the WAI-ARIA date grid, with the arrows (by day and week), Home /
 * End (the week), PageUp / PageDown (the month, the year with Shift) and
 * Enter / Space to pick. Today is marked as the current date; `minDate`,
 * `maxDate` and `disabledDates` rule days out. The week, month and weekday
 * names follow `<pxl-locale-provider>`. Bind the day with `[(value)]` or use
 * the grid as a form control (`ngModel`, `formControlName`), and the month on
 * show with `[(month)]`; leave either unset for an uncontrolled grid. A
 * `renderDay` template (its context: the day) draws each cell's content.
 *
 * The host is the grid's root.
 *
 * @example
 * <pxl-calendar-grid [(value)]="day" [minDate]="today" />
 */
@Component({
  selector: 'pxl-calendar-grid',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelCalendarGrid)],
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it (its own inline-block) still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-calendar-grid { display: block; } }',
  host: {
    '[class]': 'classes().root',
    '(focusout)': 'onFocusout($event)',
  },
  template: `
    <div [class]="classes().header">
      <button type="button" aria-label="Previous month" [class]="classes().nav" [disabled]="form.disabled()" (click)="showMonth(-1)">
        ‹
      </button>
      <span [class]="classes().title" aria-live="polite">{{ title() }}</span>
      <button type="button" aria-label="Next month" [class]="classes().nav" [disabled]="form.disabled()" (click)="showMonth(1)">
        ›
      </button>
    </div>
    <div #grid role="grid" [attr.aria-label]="title()" [class]="classes().grid" (keydown)="onKeydown($event)">
      <!-- role="grid" only allows rows: the weekday headers sit in one, as the days do. -->
      <div role="row" [class]="classes().row">
        @for (weekday of weekdays(); track weekday) {
          <div role="columnheader" [class]="classes().weekday">{{ weekday }}</div>
        }
      </div>
      @for (week of cells(); track $index) {
        <div role="row" [class]="classes().row">
          @for (cell of week; track cell.day.iso) {
            <button
              type="button"
              role="gridcell"
              [attr.aria-label]="cell.label"
              [attr.aria-selected]="cell.selected || null"
              [attr.aria-current]="cell.today ? 'date' : null"
              [attr.aria-disabled]="cell.disabled || null"
              [disabled]="cell.disabled"
              [attr.tabindex]="cell.day === tabStop() ? 0 : -1"
              [attr.data-in-range]="cell.inRange || null"
              [attr.data-range-endpoint]="cell.rangeEnd || null"
              [attr.data-today]="cell.today || null"
              [attr.data-out-of-month]="!cell.day.inMonth || null"
              [class]="cell.class"
              (click)="pick(cell.day.date)"
              (focus)="focusedDate.set(cell.day.date)"
            >
              @if (renderDay(); as template) {
                <ng-container *ngTemplateOutlet="template; context: { $implicit: cell.day.date }" />
              } @else {
                {{ cell.day.date.getDate() }}
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class PixelCalendarGrid implements ControlValueAccessor {
  /** The picked day (`[(value)]`), `null` for none; leave unset for an uncontrolled grid. */
  readonly value = model<Date | null | undefined>(undefined);
  /** Initial day while uncontrolled. */
  readonly defaultValue = input<Date | null>();
  /** First day that can be picked. */
  readonly minDate = input<Date>();
  /** Last day that can be picked. */
  readonly maxDate = input<Date>();
  /** Days that cannot be picked: a list, or a test of each day. */
  readonly disabledDates = input<Date[] | ((date: Date) => boolean)>();
  /** The month on show (`[(month)]`, any day of it); leave unset to start on the picked day's, else today's. */
  readonly month = model<Date | undefined>(undefined);
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** A range to highlight: from `from` to `to`, or to `hover` while `to` is not picked. */
  readonly rangePreview = input<CalendarRangePreview>();
  /** Draws a day's cell content in place of its number; its context is the day. */
  readonly renderDay = input<TemplateRef<{ $implicit: Date }>>();

  /** @internal */
  protected readonly form = new FormBridge<Date>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly locale = injectPxlKitLocale();
  // Week start, month and weekday names follow the kit's locale.
  private readonly calendar = computed(() => calendarLocale(this.locale().locale));
  private readonly today = startOfDay(new Date());

  /** @internal */
  protected readonly current = computed(() => {
    const value = this.value();
    return value === undefined ? (this.defaultValue() ?? null) : value;
  });
  // A form's value: `ngModel` writes it after the first render, so it moves
  // the start below until the user moves the grid.
  private readonly written = signal<Date | null>(null);
  // The month on show and the focused day as the grid first renders, from the
  // picked day, else today. Only a form's value is tracked: anything else
  // that changes later leaves them be, as React's grid does.
  private readonly start = computed(() => {
    const written = this.written();
    return untracked(() => {
      const day = this.month() ?? written ?? this.current() ?? new Date();
      const focused = written ?? this.current() ?? new Date(day.getFullYear(), day.getMonth(), 1);
      return { view: monthOf(day), focused };
    });
  });
  /** @internal */
  protected readonly view = computed(() => {
    const month = this.month();
    return month ? monthOf(month) : this.start().view;
  });
  /** @internal Roving tabindex anchor: the day that should own focus. */
  protected readonly focusedDate = signal<Date | null>(null);
  private readonly focused = computed(() => this.focusedDate() ?? this.start().focused);

  /** @internal */
  protected readonly classes = computed(() => calendarClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly title = computed(() => calendarTitle(this.calendar(), this.view()));
  /** @internal */
  protected readonly weekdays = computed(() => calendarWeekdays(this.calendar()));
  private readonly weeks = computed(() => calendarWeeks(this.view(), this.calendar().weekStartsOn));
  private readonly isDisabled = (date: Date) =>
    this.form.disabled() ||
    isDayDisabled(date, { min: this.minDate(), max: this.maxDate(), disabledDates: this.disabledDates() });
  /**
   * @internal One day of the grid is in the tab order: the focused one, or the
   * month's first enabled day while that one is not on show.
   */
  protected readonly tabStop = computed(() => calendarTabStop(this.weeks().flat(), this.focused(), this.isDisabled));
  /** @internal */
  protected readonly cells = computed(() => {
    const surface = this.effectiveSurface();
    const span = this.rangePreview() ? rangeSpan(this.rangePreview()!) : null;
    const current = this.current();
    return this.weeks().map((week) =>
      week.map((day) => {
        const disabled = this.isDisabled(day.date);
        const today = isSameDay(day.date, this.today);
        const selected = current ? isSameDay(day.date, current) : false;
        const inRange = isDayInSpan(day.date, span);
        const rangeEnd = !!span && (isSameDay(day.date, span.from) || isSameDay(day.date, span.to));
        return {
          day,
          label: this.calendar().formatDay(day.date),
          disabled,
          today,
          selected,
          inRange,
          rangeEnd,
          class: calendarDayClasses(surface, { inMonth: day.inMonth, selected, today, disabled, rangeEnd, inRange }),
        };
      }),
    );
  });

  /** @internal Show the month `count` months away (the previous / next buttons). */
  protected showMonth(count: number): void {
    const { year, month } = this.view();
    this.setView(new Date(year, month + count, 1));
  }

  private setView(day: Date): void {
    this.month.set(new Date(day.getFullYear(), day.getMonth(), 1));
  }

  /** @internal */
  protected pick(date: Date): void {
    if (this.isDisabled(date)) return;
    const day = startOfDay(date);
    this.value.set(day);
    this.form.changed(day);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const action = calendarKeydown(event.key, this.focused(), {
      weekStartsOn: this.calendar().weekStartsOn,
      shiftKey: event.shiftKey,
      isDisabled: this.isDisabled,
    });
    if (!action) return;
    event.preventDefault();
    if (action.select) {
      this.pick(this.focused());
      return;
    }
    const next = action.focus;
    if (!next) return;
    this.focusedDate.set(next);
    if (!isInMonth(next, this.view())) this.setView(next);
    afterNextRender(
      () => this.grid().nativeElement.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus(),
      { injector: this.injector },
    );
  }

  /** @internal Focus leaving the grid marks the form control touched. */
  protected onFocusout(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.form.touched();
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    const day = value instanceof Date ? value : null;
    this.value.set(day);
    this.written.set(day);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: Date) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor: every day and the month buttons are disabled with the form control. */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
