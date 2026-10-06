import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { radioGroupClasses, radioIndicatorClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import type { Option } from './option';

/**
 * Single-select radios with a pixel dot indicator, tones and surfaces. Apply
 * it to a `<fieldset>` — it becomes the `radiogroup`, and its `<legend>` the
 * label. Bind the selected value with `[(value)]`, use it as a form control
 * (`ngModel`, `formControlName`), or leave it uncontrolled. With a `name` a
 * hidden input submits the value in native forms.
 *
 * @example
 * <fieldset pxlRadioGroup label="Plan" [options]="plans" [(value)]="plan"></fieldset>
 */
@Component({
  selector: 'fieldset[pxlRadioGroup]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelRadioGroup)],
  host: {
    role: 'radiogroup',
    '[class]': 'classes().group',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.aria-required]': 'required() || null',
    // A native `disabled` or `name` on the fieldset would disable or name it
    // as a form control; the radios and the hidden input carry these.
    '[attr.disabled]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.required]': 'null',
  },
  template: `
    @if (name()) {
      <input type="hidden" [attr.name]="name()" [value]="value() ?? ''" [required]="required()" />
    }
    <legend [class]="classes().legend">{{ label() }}</legend>
    @for (radio of radios(); track radio.option.value) {
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="radio.checked"
        [attr.aria-disabled]="isDisabled()"
        [disabled]="isDisabled()"
        [class]="classes().radio"
        (click)="select(radio.option)"
        (blur)="form.touched()"
      >
        <span [class]="radio.indicator">
          @if (radio.checked) {
            <span [class]="radio.dot"></span>
          }
        </span>
        <span [class]="classes().label">{{ radio.option.label }}</span>
      </button>
    }
  `,
})
export class PixelRadioGroup implements ControlValueAccessor {
  /** Legend rendered above the radios. */
  readonly label = input.required<string>();
  /** Selected value (`[(value)]`); leave unset for an uncontrolled group. */
  readonly value = model<string | undefined>(undefined);
  /** The radios. */
  readonly options = input.required<Option[]>();
  /** Disables every radio. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the selected radio. */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits the value. */
  readonly name = input<string>();
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly classes = computed(() => radioGroupClasses(this.effectiveSurface(), this.isDisabled()));
  /** @internal */
  protected readonly radios = computed(() =>
    this.options().map((option) => {
      const checked = this.value() === option.value;
      return {
        option,
        checked,
        ...radioIndicatorClasses(this.effectiveSurface(), { tone: this.tone(), checked, disabled: this.isDisabled() }),
      };
    }),
  );

  /** @internal */
  protected select(option: Option): void {
    if (this.isDisabled()) return;
    this.value.set(option.value);
    this.form.changed(option.value);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? undefined : String(value));
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: string) => void): void {
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
