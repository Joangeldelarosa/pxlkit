import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { passwordInputClasses, type Size, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Password field with an inline show / hide toggle (a `<button>` with
 * `aria-pressed`, left out of the tab order) that swaps the input between
 * `password` and `text`. Bind its value with `[(value)]`, use it as a form
 * control (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`.
 *
 * The host is layout-neutral (`display: contents`); the native attributes it
 * takes as inputs (`name`, `placeholder`, …) go to the inner `<input>`, whose
 * events bubble through the host.
 *
 * @example
 * <pxl-password-input label="Password" autocomplete="current-password" formControlName="password" />
 */
@Component({
  selector: 'pxl-password-input',
  imports: [PixelFieldShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelPasswordInput)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner input; as attributes on the host they
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
        <input
          [id]="inputId()"
          [attr.type]="visible() ? 'text' : 'password'"
          [attr.name]="name() ?? null"
          [attr.placeholder]="placeholder() ?? null"
          [attr.autocomplete]="autocomplete() ?? null"
          [attr.minlength]="minlength() ?? null"
          [attr.maxlength]="maxlength() ?? null"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-invalid]="error() ? true : null"
          [required]="required()"
          [readOnly]="readonly()"
          [disabled]="isDisabled()"
          [value]="current()"
          [class]="classes().input"
          (input)="onInput($event)"
          (blur)="form.touched()"
        />
        <button
          type="button"
          tabindex="-1"
          [attr.aria-label]="toggleLabel()"
          [attr.aria-pressed]="visible()"
          [class]="classes().toggle"
          [disabled]="isDisabled()"
          (click)="toggle()"
        >
          {{ toggleLabel() }}
        </button>
      </span>
    </pxl-field-shell>
  `,
})
export class PixelPasswordInput implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled input. */
  readonly value = model<string | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string>();
  /** Label rendered above the input. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the input invalid. */
  readonly error = input<string>();
  /** Tone of the focus ring. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Field height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Text of the toggle, as `[showLabel, hideLabel]`. */
  readonly toggleLabels = input<[string, string], [string, string] | undefined>(['Show', 'Hide'], {
    transform: withDefault<[string, string]>(['Show', 'Hide']),
  });
  /** Disables the input and the toggle. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** `id` of the input; generated when left out. */
  readonly id = input<string>();
  /** Native `name` of the input. */
  readonly name = input<string>();
  /** Native `placeholder`. */
  readonly placeholder = input<string>();
  /** Native `autocomplete` hint (`current-password`, `new-password`). */
  readonly autocomplete = input<string>();
  /** Native `minlength`. */
  readonly minlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Native `maxlength`. */
  readonly maxlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Marks the input required. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** Makes the input read-only. */
  readonly readonly = input(false, { transform: booleanOr(false) });
  /** Accessible name of the input when no `label` is shown. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
  /** @internal */
  protected readonly visible = signal(false);

  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly toggleLabel = computed(() => this.toggleLabels()[this.visible() ? 1 : 0]);
  /** @internal */
  protected readonly classes = computed(() =>
    passwordInputClasses(this.effectiveSurface(), { tone: this.tone(), size: this.size(), invalid: !!this.error() }),
  );

  /** @internal */
  protected toggle(): void {
    if (!this.isDisabled()) this.visible.set(!this.visible());
  }

  /** @internal */
  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.form.changed(value);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
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
