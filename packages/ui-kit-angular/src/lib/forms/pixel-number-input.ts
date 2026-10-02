import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  clampNumber,
  formatNumberInput,
  numberInputAtLimit,
  numberInputClasses,
  parseNumberInput,
  settleNumberInput,
  stepNumberInput,
  type NumberInputClampBehavior,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Numeric field (`role="spinbutton"`) with ArrowUp / ArrowDown and stepper
 * buttons, min / max clamping, precision, a prefix and suffix, and a
 * thousands separator. Bind its value with `[(value)]`, use it as a form
 * control (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`. With a `name` a hidden input submits the number in native
 * forms.
 *
 * The host is layout-neutral (`display: contents`); the native attributes it
 * takes as inputs go to the inner `<input>`, whose events bubble through the
 * host.
 *
 * @example
 * <pxl-number-input label="Price" prefix="$" [precision]="2" [step]="0.01" [min]="0" [(value)]="price" />
 */
@Component({
  selector: 'pxl-number-input',
  imports: [PixelFieldShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelNumberInput)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner inputs; as attributes on the host they
    // would duplicate the id, name the wrong element or mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
    '[attr.readonly]': 'null',
    '[attr.aria-label]': 'null',
  },
  template: `
    <pxl-field-shell
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [surface]="effectiveSurface()"
      [htmlFor]="inputId()"
    >
      <span [class]="classes().shell">
        @if (prefix()) {
          <span aria-hidden="true" [class]="classes().prefix">{{ prefix() }}</span>
        }
        <input
          [id]="inputId()"
          type="text"
          inputmode="decimal"
          role="spinbutton"
          [attr.aria-valuemin]="min() ?? null"
          [attr.aria-valuemax]="max() ?? null"
          [attr.aria-valuenow]="current() ?? null"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.placeholder]="placeholder() ?? null"
          [required]="required()"
          [readOnly]="readonly()"
          [disabled]="isDisabled()"
          [value]="display()"
          [class]="classes().input"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeydown($event)"
        />
        @if (suffix()) {
          <span aria-hidden="true" [class]="classes().suffix">{{ suffix() }}</span>
        }
        @if (!hideControls()) {
          <span [class]="classes().controls">
            <button
              type="button"
              tabindex="-1"
              aria-label="Increment"
              [disabled]="isDisabled() || atLimit(1)"
              [class]="classes().stepper"
              (click)="stepFromButton(1)"
            >▲</button>
            <button
              type="button"
              tabindex="-1"
              aria-label="Decrement"
              [disabled]="isDisabled() || atLimit(-1)"
              [class]="classes().stepper"
              (click)="stepFromButton(-1)"
            >▼</button>
          </span>
        }
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="current() ?? ''" />
        }
      </span>
    </pxl-field-shell>
  `,
})
export class PixelNumberInput implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled field. */
  readonly value = model<number | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Lowest value. */
  readonly min = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Highest value. */
  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Amount each step adds or removes. */
  readonly step = input(1, { transform: numberOr(1) });
  /** Decimals shown, and the value is rounded to. */
  readonly precision = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** When a value outside `min` / `max` is pulled back: while typing, on blur, or never. */
  readonly clampBehavior = input<NumberInputClampBehavior, NumberInputClampBehavior | undefined>('blur', {
    transform: withDefault<NumberInputClampBehavior>('blur'),
  });
  /** Text inside the field on the left (`$`). */
  readonly prefix = input<string>();
  /** Text inside the field on the right (`USD`). */
  readonly suffix = input<string>();
  /** Groups the integer digits (`,` shows `1,500,000`). */
  readonly thousandsSeparator = input<string>();
  /** Accepts negative numbers. */
  readonly allowNegative = input(true, { transform: booleanOr(true) });
  /** Hides the stepper buttons. */
  readonly hideControls = input(false, { transform: booleanOr(false) });
  /** Field height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Tone of the focus ring. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Label rendered above the field. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the input invalid. */
  readonly error = input<string>();
  /** Disables the field and its steppers. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Form field name — a hidden input submits the number. */
  readonly name = input<string>();
  /** `id` of the input; generated when left out. */
  readonly id = input<string>();
  /** Text shown while the field is empty. */
  readonly placeholder = input<string>();
  /** Marks the field required. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** Makes the field read-only. */
  readonly readonly = input(false, { transform: booleanOr(false) });
  /** Accessible name of the field when no `label` is shown. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @internal */
  protected readonly form = new FormBridge<number>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
  private focused = false;

  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue());
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  private readonly limits = computed(() => ({ min: this.min(), max: this.max(), precision: this.precision() }));

  /**
   * @internal What the field shows. It does not follow the value while
   * focused, so partial input such as "" or "-" survives typing.
   */
  protected readonly display = linkedSignal<{ value: number | undefined; text: string }, string>({
    source: () => ({ value: this.current(), text: this.format(this.current()) }),
    computation: (source, previous) => (previous && this.focused ? previous.value : source.text),
  });

  /** @internal */
  protected readonly classes = computed(() =>
    numberInputClasses(this.effectiveSurface(), {
      tone: this.tone(),
      size: this.size(),
      invalid: !!this.error(),
      prefix: !!this.prefix(),
      suffix: !!this.suffix(),
      hideControls: this.hideControls(),
    }),
  );

  /** @internal */
  protected atLimit(direction: 1 | -1): boolean {
    return numberInputAtLimit(this.current(), direction, this.limits());
  }

  /** @internal A stepper at its bound is disabled: like any disabled button, it ignores clicks. */
  protected stepFromButton(direction: 1 | -1): void {
    if (!this.atLimit(direction)) this.bump(direction);
  }

  /** @internal */
  protected onInput(event: Event): void {
    const { text, num } = parseNumberInput(
      (event.target as HTMLInputElement).value,
      this.thousandsSeparator(),
      this.allowNegative(),
    );
    this.display.set(text);
    if (num === undefined) return;
    let next = num;
    if (this.clampBehavior() === 'strict') {
      next = clampNumber(next, this.min(), this.max());
      if (next !== num) this.display.set(this.format(next));
    }
    this.commit(next);
  }

  /** @internal */
  protected onFocus(): void {
    this.focused = true;
  }

  /** @internal */
  protected onBlur(): void {
    this.focused = false;
    const value = this.current();
    if (typeof value === 'number') {
      const next = settleNumberInput(value, this.clampBehavior(), this.limits());
      if (next !== value) this.commit(next);
      this.display.set(this.format(next));
    } else {
      this.display.set('');
    }
    this.form.touched();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.bump(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.bump(-1);
    }
  }

  private bump(direction: 1 | -1): void {
    if (this.isDisabled()) return;
    const next = stepNumberInput(this.current(), direction, this.step(), this.limits());
    this.commit(next);
    // A step taken from the keyboard shows its result itself.
    if (this.focused) this.display.set(this.format(next));
  }

  private commit(next: number): void {
    this.value.set(next);
    if (!Number.isNaN(next)) this.form.changed(next);
  }

  private format(value: number | undefined): string {
    return formatNumberInput(value, this.precision(), this.thousandsSeparator());
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? undefined : Number(value));
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: number) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
