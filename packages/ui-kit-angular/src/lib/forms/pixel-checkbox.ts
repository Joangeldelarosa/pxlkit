import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { checkboxClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Checkbox (`role="checkbox"`) with a chunky pixel check mark, tones and
 * surfaces. Bind its state with `[(checked)]`, use it as a form control
 * (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultChecked`. With a `name` it submits `value` in native forms while
 * checked.
 *
 * The host is layout-neutral (`display: contents`); the checkbox itself is
 * the `<button>` inside.
 *
 * @example
 * <pxl-checkbox label="Accept terms" [(checked)]="accepted" />
 * <pxl-checkbox label="Remember me" formControlName="remember" />
 */
@Component({
  selector: 'pxl-checkbox',
  imports: [PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelCheckbox)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner button and hidden input; as attributes
    // on the host they would duplicate the id or mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
  },
  template: `
    @if (name() && isChecked()) {
      <input type="hidden" [attr.name]="name()" [value]="value()" [required]="required()" />
    }
    <button
      type="button"
      role="checkbox"
      [attr.id]="id() ?? null"
      [attr.aria-checked]="isChecked()"
      [attr.aria-disabled]="isDisabled()"
      [attr.aria-required]="required() || null"
      [disabled]="isDisabled()"
      [class]="classes().button"
      (click)="toggle()"
      (blur)="form.touched()"
    >
      <span [class]="classes().box">
        @if (isChecked()) {
          <svg pxlGlyph="check" [class]="classes().check"></svg>
        }
      </span>
      <span [class]="classes().label">{{ label() }}</span>
    </button>
  `,
})
export class PixelCheckbox implements ControlValueAccessor {
  /** Label rendered next to the box. */
  readonly label = input.required<string>();
  /** Checked state (`[(checked)]`); leave unset for an uncontrolled checkbox. */
  readonly checked = model<boolean | undefined>(undefined);
  /** Initial checked state while uncontrolled. */
  readonly defaultChecked = input(false, { transform: booleanOr(false) });
  /** Disables interaction and greys out the control. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the checked box. */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits `value` while checked. */
  readonly name = input<string>();
  /** Form value while checked. */
  readonly value = input<string, string | undefined>('on', { transform: withDefault('on') });
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** `id` of the checkbox button. */
  readonly id = input<string>();

  /** @internal */
  protected readonly form = new FormBridge<boolean>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly isChecked = computed(() => this.checked() ?? this.defaultChecked());
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());

  /** @internal */
  protected readonly classes = computed(() =>
    checkboxClasses(this.effectiveSurface(), {
      tone: this.tone(),
      checked: this.isChecked(),
      disabled: this.isDisabled(),
    }),
  );

  /** @internal */
  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.isChecked();
    this.checked.set(next);
    this.form.changed(next);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.checked.set(value == null ? undefined : Boolean(value));
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: boolean) => void): void {
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
