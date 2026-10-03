import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
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
  dateRangeText,
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  monthOf,
  orderDays,
  pickDateRange,
  rangeSpan,
  shiftMonth,
  startOfDay,
  toIsoDate,
  type DateRangeValue,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { PixelPopover } from '../overlay-foundation/pixel-popover';
import { PixelPopoverContent } from '../overlay-foundation/pixel-popover-content';
import { PixelPopoverTrigger } from '../overlay-foundation/pixel-popover-trigger';
import { injectPxlKitLocale } from '../overlay-foundation/pxl-kit-locale-provider';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** A quick pick of a whole range, shown above the months. */
export interface PixelDateRangePickerPreset {
  label: string;
  value: { from: Date; to: Date };
}

/**
 * Date range field: a trigger that shows the range and opens one or two
 * months in a popover dialog, where a first pick starts the range and a
 * second ends it (in either order), the hovered day previewing the end.
 * Focus moves to the range's start (today without one) as it opens; the
 * months take the arrows (by day and week), Home / End (the week), PageUp /
 * PageDown (the month, the year with Shift) and Enter / Space to pick.
 * Presets pick a whole range; `clearable` adds a clear target to the trigger
 * and a Clear button under the months. The week and names follow
 * `<pxl-locale-provider>`. Bind the range with `[(value)]`, use it as a form
 * control (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`; with a `name`, hidden inputs submit `name.from` and
 * `name.to` as `YYYY-MM-DD`.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-date-range-picker label="Stay" [numberOfMonths]="1" [(value)]="stay" />
 */
@Component({
  selector: 'pxl-date-range-picker',
  imports: [PixelFieldShell, PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelDateRangePicker)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden inputs; as attributes
    // on the host they would duplicate the id, describe the wrong element or
    // mislead form tooling and tests.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.data-testid]': 'null',
  },
  template: `
    <pxl-field-shell
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [surface]="effectiveSurface()"
      [htmlFor]="triggerId()"
      [messageId]="messageId()"
    >
      <span [class]="classes().anchor">
        <pxl-popover
          [open]="open()"
          (openChange)="onOpenChange($event)"
          side="bottom"
          align="start"
          [surface]="effectiveSurface()"
        >
          <button
            #trigger
            pxlPopoverTrigger
            type="button"
            [id]="triggerId()"
            [attr.data-testid]="dataTestid() ?? null"
            aria-haspopup="dialog"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy() ?? null"
            [disabled]="form.disabled()"
            [class]="classes().trigger"
            (blur)="form.touched()"
          >
            <span [class]="classes().value">{{ text() }}</span>
            @if (showClear()) {
              <!-- A focusable span, as a <button> cannot nest in the trigger. -->
              <span
                role="button"
                tabindex="0"
                aria-label="Clear range"
                [class]="classes().clearMark"
                (click)="clearFromTrigger($event)"
                (keydown)="onClearKeydown($event)"
              >×</span>
            } @else {
              <span aria-hidden="true" [class]="classes().mark">▾</span>
            }
          </button>
          <div *pxlPopoverContent="effectiveSurface()" aria-label="Choose date range" [class]="classes().content">
            @if (presets()?.length) {
              <div [class]="classes().presets">
                @for (preset of presets(); track preset.label) {
                  <button type="button" [class]="classes().preset" (click)="pickPreset(preset)">{{ preset.label }}</button>
                }
              </div>
            }
            <div #months [class]="classes().months">
              @for (panel of panels(); track panel.titleId) {
                <div [class]="gridClasses().panel">
                  <div [class]="gridClasses().header">
                    @if (panel.showPrev) {
                      <button type="button" aria-label="Previous month" [class]="gridClasses().nav" (click)="showMonth(-1)">‹</button>
                    } @else {
                      <span [class]="gridClasses().navSpacer" aria-hidden="true"></span>
                    }
                    <span [id]="panel.titleId" [class]="gridClasses().title" aria-live="polite">{{ panel.title }}</span>
                    @if (panel.showNext) {
                      <button type="button" aria-label="Next month" [class]="gridClasses().nav" (click)="showMonth(1)">›</button>
                    } @else {
                      <span [class]="gridClasses().navSpacer" aria-hidden="true"></span>
                    }
                  </div>
                  <div role="grid" [attr.aria-labelledby]="panel.titleId" [class]="gridClasses().grid" (keydown)="onKeydown($event)">
                    <div role="row" [class]="gridClasses().row">
                      @for (weekday of weekdays(); track weekday) {
                        <div role="columnheader" [class]="gridClasses().weekday">{{ weekday }}</div>
                      }
                    </div>
                    @for (week of panel.cells; track $index) {
                      <div role="row" [class]="gridClasses().row">
                        @for (cell of week; track cell.day.iso) {
                          <button
                            type="button"
                            role="gridcell"
                            [attr.aria-label]="cell.label"
                            [attr.aria-selected]="cell.edge || null"
                            [attr.aria-current]="cell.today ? 'date' : null"
                            [attr.aria-disabled]="cell.disabled || null"
                            [disabled]="cell.disabled"
                            [attr.tabindex]="cell.day === tabStop() ? 0 : -1"
                            [class]="cell.class"
                            (click)="pick(cell.day.date)"
                            (mouseenter)="hover.set(cell.day.date)"
                            (focus)="onFocusDay(cell.day.date)"
                          >
                            {{ cell.day.date.getDate() }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            @if (showClear()) {
              <div [class]="classes().footer">
                <button type="button" [class]="classes().clear" (click)="clear()">Clear</button>
              </div>
            }
          </div>
        </pxl-popover>
        @if (name(); as name) {
          <input type="hidden" [attr.name]="name + '.from'" [value]="hiddenValues().from" readonly />
          <input type="hidden" [attr.name]="name + '.to'" [value]="hiddenValues().to" readonly />
        }
      </span>
    </pxl-field-shell>
  `,
})
export class PixelDateRangePicker implements ControlValueAccessor {
  /** The range (`[(value)]`); leave unset for an uncontrolled picker. */
  readonly value = model<DateRangeValue | undefined>(undefined);
  /** Initial range while uncontrolled. */
  readonly defaultValue = input<DateRangeValue>();
  /** First day that can be picked. */
  readonly min = input<Date>();
  /** Last day that can be picked. */
  readonly max = input<Date>();
  /** Quick picks of whole ranges, shown above the months. */
  readonly presets = input<PixelDateRangePickerPreset[]>();
  /** Months shown side by side. */
  readonly numberOfMonths = input<1 | 2, 1 | 2 | undefined>(2, { transform: withDefault<1 | 2>(2) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Trigger height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Label rendered above the trigger. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the trigger invalid. */
  readonly error = input<string>();
  /** Text shown while no range is picked. */
  readonly placeholder = input<string, string | undefined>('Select date range', {
    transform: withDefault('Select date range'),
  });
  /** Adds a clear target to the trigger and a Clear button under the months while a range is set. */
  readonly clearable = input(false, { transform: booleanOr(false) });
  /** Form field name — hidden inputs submit `name.from` and `name.to` as `YYYY-MM-DD`. */
  readonly name = input<string>();
  /** `id` of the trigger; generated when left out. */
  readonly id = input<string>();
  /** Ids of more elements that describe the trigger; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  /** `data-testid` of the trigger. */
  readonly dataTestid = input<string | undefined>(undefined, { alias: 'data-testid' });

  /** @internal */
  protected readonly form = new FormBridge<DateRangeValue>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly locale = injectPxlKitLocale();
  // Week start, month and weekday names follow the kit's locale.
  private readonly calendar = computed(() => calendarLocale(this.locale().locale));
  private readonly generatedId = injectId();
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly monthsElement = viewChild<ElementRef<HTMLElement>>('months');

  /** @internal */
  protected readonly open = signal(false);
  /** @internal */
  protected readonly hover = signal<Date | null>(null);
  // The start of a range in progress, between the first and the second pick.
  private readonly pending = signal<Date | null>(null);
  // The left month on show and the roving tabindex anchor, both set as the
  // popover opens.
  private readonly view = signal(monthOf(new Date()));
  private readonly focusedDate = signal(startOfDay(new Date()));
  // Today as of the latest opening, for the current-date mark.
  private readonly today = signal(startOfDay(new Date()));

  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? {});
  /** @internal */
  protected readonly triggerId = computed(() => this.id() ?? `pxl-daterange-${this.generatedId}`);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.triggerId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.triggerId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly text = computed(() => dateRangeText(this.current(), this.calendar().formatDay, this.placeholder()));
  /** @internal */
  protected readonly showClear = computed(() => this.clearable() && !!(this.current().from || this.current().to));
  /** @internal */
  protected readonly hiddenValues = computed(() => {
    const { from, to } = this.current();
    return { from: from ? toIsoDate(from) : '', to: to ? toIsoDate(to) : '' };
  });
  /** @internal */
  protected readonly classes = computed(() =>
    datePickerClasses(this.effectiveSurface(), {
      size: this.size(),
      invalid: !!this.error(),
      placeholder: !this.current().from && !this.current().to,
      months: this.numberOfMonths(),
    }),
  );
  /** @internal */
  protected readonly gridClasses = computed(() => calendarClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly weekdays = computed(() => calendarWeekdays(this.calendar()));
  private readonly isDisabled = (date: Date) => isDayDisabled(date, { min: this.min(), max: this.max() });
  private readonly months = computed(() => {
    const months = this.numberOfMonths() === 2 ? [this.view(), shiftMonth(this.view(), 1)] : [this.view()];
    return months.map((month, index) => ({
      month,
      titleId: `${this.generatedId}-${index === 0 ? 'left' : 'right'}`,
      title: calendarTitle(this.calendar(), month),
      showPrev: index === 0,
      showNext: index === months.length - 1,
      weeks: calendarWeeks(month, this.calendar().weekStartsOn),
    }));
  });
  /**
   * @internal One day of the months on show is in the tab order: the focused
   * one, or the left month's first enabled day while that one is not on show.
   */
  protected readonly tabStop = computed(() =>
    calendarTabStop(
      this.months().flatMap((month) => month.weeks.flat()),
      this.focusedDate(),
      this.isDisabled,
    ),
  );
  /** @internal The months, with their days as shown: the pending start and the hovered day preview the range. */
  protected readonly panels = computed(() => {
    const surface = this.effectiveSurface();
    const pending = this.pending();
    const from = pending ?? this.current().from;
    const to = pending ? undefined : this.current().to;
    const span = rangeSpan({ from, to, hover: this.hover() });
    return this.months().map((month) => ({
      ...month,
      cells: month.weeks.map((week) =>
        week.map((day) => {
          const disabled = this.isDisabled(day.date);
          const today = isSameDay(day.date, this.today());
          const edge = (!!from && isSameDay(day.date, from)) || (!!to && isSameDay(day.date, to));
          return {
            day,
            label: this.calendar().formatDay(day.date),
            disabled,
            today,
            edge,
            class: calendarDayClasses(surface, {
              inMonth: day.inMonth,
              selected: edge,
              today,
              disabled,
              inRange: isDayInSpan(day.date, span),
              rangeSelected: true,
            }),
          };
        }),
      ),
    }));
  });

  /** @internal Each opening jumps the view to the range's start and starts a new pick. */
  protected onOpenChange(open: boolean): void {
    if (open) {
      const start = this.current().from ?? new Date();
      this.view.set(monthOf(start));
      this.today.set(startOfDay(new Date()));
      this.focusedDate.set(startOfDay(start));
      this.pending.set(null);
      this.hover.set(null);
      this.focusTabStop();
    }
    this.open.set(open);
  }

  /** @internal The first pick starts a range, the second completes it and closes. */
  protected pick(date: Date): void {
    if (this.isDisabled(date)) return;
    const next = pickDateRange(this.pending(), date);
    this.setRange(next.range);
    this.pending.set(next.pending);
    if (next.pending) return;
    this.hover.set(null);
    this.open.set(false);
  }

  /** @internal */
  protected pickPreset(preset: PixelDateRangePickerPreset): void {
    this.setRange(orderDays(preset.value.from, preset.value.to));
    this.pending.set(null);
    this.hover.set(null);
    this.open.set(false);
  }

  /** @internal */
  protected clear(): void {
    this.setRange({});
    this.pending.set(null);
    this.hover.set(null);
  }

  /**
   * @internal The trigger's clear target turns into the ▾ mark once the range
   * is gone: focus moves to the trigger it sits in rather than stay on a
   * hidden mark.
   */
  protected clearFromTrigger(event: Event): void {
    event.stopPropagation();
    this.clear();
    this.trigger().nativeElement.focus();
  }

  /** @internal */
  protected onClearKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.clearFromTrigger(event);
  }

  /** @internal */
  protected showMonth(count: number): void {
    this.view.set(shiftMonth(this.view(), count));
  }

  /** @internal */
  protected onFocusDay(date: Date): void {
    this.hover.set(date);
    this.focusedDate.set(date);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const action = calendarKeydown(event.key, this.focusedDate(), {
      weekStartsOn: this.calendar().weekStartsOn,
      shiftKey: event.shiftKey,
      isDisabled: this.isDisabled,
    });
    if (!action) return;
    event.preventDefault();
    if (action.select) {
      this.pick(this.focusedDate());
      return;
    }
    const next = action.focus;
    if (!next) return;
    this.focusedDate.set(next);
    // A page moves the left month to the new day's; a day or a week moves the
    // view only when the new day leaves both months on show.
    const paged = event.key === 'PageUp' || event.key === 'PageDown';
    if (paged || !this.months().some(({ month }) => isInMonth(next, month))) this.view.set(monthOf(next));
    this.focusTabStop();
  }

  private setRange(range: DateRangeValue): void {
    this.value.set(range);
    this.form.changed(range);
  }

  // Focus the tab stop — in this picker's own months, where a day shows once
  // in each month it borders.
  private focusTabStop(): void {
    afterNextRender(
      () => this.monthsElement()?.nativeElement.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus(),
      { injector: this.injector },
    );
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set((value as DateRangeValue | null) ?? {});
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: DateRangeValue) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor: the trigger is disabled with the form control. */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
