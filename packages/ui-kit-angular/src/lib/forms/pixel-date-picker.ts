import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
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
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isSameDay,
  monthOf,
  shiftMonth,
  startOfDay,
  toIsoDate,
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

/** A quick pick shown above the grid. */
export interface PixelDatePickerPreset {
  label: string;
  value: Date;
}

/**
 * Date field: a trigger that shows the picked day and opens a month's grid
 * in a popover dialog, with optional quick-pick presets and a Clear button.
 * Focus moves to the picked day (today's without one) as it opens; the grid
 * takes the arrows (by day and week), Home / End (the week), PageUp /
 * PageDown (the month, the year with Shift) and Enter / Space to pick, which
 * closes it with focus back on the trigger. `min`, `max` and `disabledDates`
 * rule days out; the week and names follow `<pxl-locale-provider>`. Bind the
 * day with `[(value)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled with `defaultValue`; with a
 * `name` a hidden input submits it as `YYYY-MM-DD`.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-date-picker label="Due date" clearable [(value)]="due" />
 */
@Component({
  selector: 'pxl-date-picker',
  imports: [PixelFieldShell, PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelDatePicker)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden input; as attributes
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
            <span aria-hidden="true" [class]="classes().mark">{{ current() ? '×' : '▾' }}</span>
          </button>
          <div *pxlPopoverContent="effectiveSurface()" aria-label="Choose date" [class]="classes().content">
            @if (presets()?.length) {
              <div [class]="classes().presets">
                @for (preset of presets(); track preset.label) {
                  <button type="button" [class]="classes().preset" (click)="pick(preset.value)">{{ preset.label }}</button>
                }
              </div>
            }
            <div [class]="gridClasses().header">
              <button type="button" aria-label="Previous month" [class]="gridClasses().nav" (click)="showMonth(-1)">‹</button>
              <span [class]="gridClasses().title" aria-live="polite">{{ title() }}</span>
              <button type="button" aria-label="Next month" [class]="gridClasses().nav" (click)="showMonth(1)">›</button>
            </div>
            <div #grid role="grid" [attr.aria-label]="title()" [class]="gridClasses().grid" (keydown)="onKeydown($event)">
              <div role="row" [class]="gridClasses().row">
                @for (weekday of weekdays(); track weekday) {
                  <div role="columnheader" [class]="gridClasses().weekday">{{ weekday }}</div>
                }
              </div>
              @for (week of cells(); track $index) {
                <div role="row" [class]="gridClasses().row">
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
                      [class]="cell.class"
                      (click)="pick(cell.day.date)"
                      (focus)="focusedDate.set(cell.day.date)"
                    >
                      {{ cell.day.date.getDate() }}
                    </button>
                  }
                </div>
              }
            </div>
            @if (clearable() && current()) {
              <div [class]="classes().footer">
                <button type="button" [class]="classes().clear" (click)="clear()">Clear</button>
              </div>
            }
          </div>
        </pxl-popover>
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="hiddenValue()" readonly />
        }
      </span>
    </pxl-field-shell>
  `,
})
export class PixelDatePicker implements ControlValueAccessor {
  /** The picked day (`[(value)]`), `null` for none; leave unset for an uncontrolled picker. */
  readonly value = model<Date | null | undefined>(undefined);
  /** Initial day while uncontrolled. */
  readonly defaultValue = input<Date>();
  /** First day that can be picked. */
  readonly min = input<Date>();
  /** Last day that can be picked. */
  readonly max = input<Date>();
  /** Days that cannot be picked: a list, or a test of each day. */
  readonly disabledDates = input<Date[] | ((date: Date) => boolean)>();
  /** The trigger's text for the picked day; the locale's long date by default. */
  readonly format = input<(date: Date) => string>();
  /** Text shown while no day is picked. */
  readonly placeholder = input<string, string | undefined>('Select date', { transform: withDefault('Select date') });
  /** Shows a Clear button under the grid while a day is picked. */
  readonly clearable = input(false, { transform: booleanOr(false) });
  /** Quick picks shown above the grid. */
  readonly presets = input<PixelDatePickerPreset[]>();
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
  /** Form field name — a hidden input submits the day as `YYYY-MM-DD`. */
  readonly name = input<string>();
  /** `id` of the trigger; generated when left out. */
  readonly id = input<string>();
  /** Ids of more elements that describe the trigger; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  /** `data-testid` of the trigger. */
  readonly dataTestid = input<string | undefined>(undefined, { alias: 'data-testid' });

  /** @internal */
  protected readonly form = new FormBridge<Date | null>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly locale = injectPxlKitLocale();
  // Week start, month and weekday names follow the kit's locale.
  private readonly calendar = computed(() => calendarLocale(this.locale().locale));
  private readonly generatedId = injectId();
  private readonly injector = inject(Injector);
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');

  /** @internal */
  protected readonly open = signal(false);
  /** @internal */
  protected readonly current = computed(() => {
    const value = this.value();
    return value === undefined ? (this.defaultValue() ?? null) : value;
  });
  /** @internal The month on show: it follows the value to its month whenever that changes. */
  protected readonly view = linkedSignal<number | undefined, { year: number; month: number }>({
    source: () => this.current()?.getTime(),
    computation: (time, previous) =>
      time !== undefined ? monthOf(new Date(time)) : (previous?.value ?? monthOf(this.defaultValue() ?? new Date())),
  });
  /** @internal Roving tabindex anchor: the day that should own focus, set as the grid opens. */
  protected readonly focusedDate = signal<Date>(new Date());
  // Today as of the latest opening, for the current-date mark.
  private readonly today = signal(startOfDay(new Date()));

  /** @internal */
  protected readonly triggerId = computed(() => this.id() ?? `pxl-date-${this.generatedId}`);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.triggerId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.triggerId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly text = computed(() => {
    const current = this.current();
    return current ? (this.format() ?? this.calendar().formatDay)(current) : this.placeholder();
  });
  /** @internal */
  protected readonly hiddenValue = computed(() => {
    const current = this.current();
    return current ? toIsoDate(current) : '';
  });
  /** @internal */
  protected readonly classes = computed(() =>
    datePickerClasses(this.effectiveSurface(), { size: this.size(), invalid: !!this.error(), placeholder: !this.current() }),
  );
  /** @internal */
  protected readonly gridClasses = computed(() => calendarClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly title = computed(() => calendarTitle(this.calendar(), this.view()));
  /** @internal */
  protected readonly weekdays = computed(() => calendarWeekdays(this.calendar()));
  private readonly weeks = computed(() => calendarWeeks(this.view(), this.calendar().weekStartsOn));
  private readonly isDisabled = (date: Date) =>
    isDayDisabled(date, { min: this.min(), max: this.max(), disabledDates: this.disabledDates() });
  /**
   * @internal One day of the grid is in the tab order: the focused one, or the
   * month's first enabled day while that one is not on show.
   */
  protected readonly tabStop = computed(() => calendarTabStop(this.weeks().flat(), this.focusedDate(), this.isDisabled));
  /** @internal */
  protected readonly cells = computed(() => {
    const surface = this.effectiveSurface();
    const current = this.current();
    return this.weeks().map((week) =>
      week.map((day) => {
        const disabled = this.isDisabled(day.date);
        const today = isSameDay(day.date, this.today());
        const selected = current ? isSameDay(day.date, current) : false;
        return {
          day,
          label: this.calendar().formatDay(day.date),
          disabled,
          today,
          selected,
          class: calendarDayClasses(surface, { inMonth: day.inMonth, selected, today, disabled }),
        };
      }),
    );
  });

  constructor() {
    // A value cleared or replaced while open resets the focused day.
    effect(() => {
      const current = this.current();
      if (untracked(this.open)) this.focusedDate.set(current ?? new Date());
    });
  }

  /** @internal Each opening shows the value's month with focus on its day (today's without a value). */
  protected onOpenChange(open: boolean): void {
    if (open) {
      const current = this.current();
      if (current) this.view.set(monthOf(current));
      this.today.set(startOfDay(new Date()));
      this.focusedDate.set(current ?? new Date());
      this.focusTabStop();
    }
    this.open.set(open);
  }

  /** @internal */
  protected pick(date: Date): void {
    if (this.isDisabled(date)) return;
    this.setValue(startOfDay(date));
    this.open.set(false);
  }

  /** @internal */
  protected clear(): void {
    this.setValue(null);
  }

  /** @internal */
  protected showMonth(count: number): void {
    this.view.set(shiftMonth(this.view(), count));
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
    // Page the view to the new day's month so its cell exists.
    this.view.set(monthOf(next));
    this.focusTabStop();
  }

  private setValue(value: Date | null): void {
    this.value.set(value);
    this.form.changed(value);
  }

  private focusTabStop(): void {
    afterNextRender(
      () => this.grid()?.nativeElement.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus(),
      { injector: this.injector },
    );
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value instanceof Date ? value : null);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: Date | null) => void): void {
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
