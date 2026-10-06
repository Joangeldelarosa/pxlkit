import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Toggle switch (`role="switch"`) with a label, tones and surfaces. Bind its
 * state with `[(checked)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled with `defaultChecked`. With a
 * `name` it submits `value` in native forms while on.
 *
 * The host is layout-neutral (`display: contents`); the switch itself is the
 * `<button>` inside.
 *
 * @example
 * <pxl-switch label="Notifications" [(checked)]="notify" />
 * <pxl-switch label="Newsletter" formControlName="newsletter" />
 */
@Component({
  selector: 'pxl-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelSwitch)],
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
      role="switch"
      [attr.id]="id() ?? null"
      [attr.aria-checked]="isChecked()"
      [attr.aria-disabled]="isDisabled()"
      [attr.aria-required]="required() || null"
      [disabled]="isDisabled()"
      [class]="classes().button"
      (click)="toggle()"
      (blur)="form.touched()"
    >
      <span [class]="classes().track"><span [class]="classes().thumb"></span></span>
      <span class="select-none">{{ label() }}</span>
    </button>
  `,
})
export class PixelSwitch implements ControlValueAccessor {
  /** Label rendered next to the switch. */
  readonly label = input.required<string>();
  /** Checked state (`[(checked)]`); leave unset for an uncontrolled switch. */
  readonly checked = model<boolean | undefined>(undefined);
  /** Initial checked state while uncontrolled. */
  readonly defaultChecked = input(false, { transform: booleanOr(false) });
  /** Disables interaction and greys out the control. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the "on" state. */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits `value` while on. */
  readonly name = input<string>();
  /** Form value while on. */
  readonly value = input<string, string | undefined>('on', { transform: withDefault('on') });
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** `id` of the switch button. */
  readonly id = input<string>();

  /** @internal */
  protected readonly form = new FormBridge<boolean>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly isChecked = computed(() => this.checked() ?? this.defaultChecked());
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());

  /** @internal */
  protected readonly classes = computed(() => {
    const surface = this.effectiveSurface();
    const s = surfaceClasses(surface);
    const t = toneMap[this.tone()];
    const pixel = surface === 'pixel';
    const checked = this.isChecked();
    return {
      button: cn(
        'group inline-flex items-center gap-3 text-sm text-retro-text focus-visible:outline-hidden',
        s.font,
        focusRing,
        t.ring,
        this.disabled() && 'opacity-50 cursor-not-allowed',
      ),
      track: cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center transition-colors',
        s.border,
        pixel ? 'rounded-[3px]' : 'rounded-full',
        checked ? cn(t.border, t.bg) : 'border-retro-border-strong bg-retro-surface',
      ),
      thumb: cn(
        'absolute left-0.5 h-4 w-4 transition-transform',
        pixel ? 'rounded-[2px]' : 'rounded-full',
        checked ? cn('translate-x-5', t.fill) : 'translate-x-0 bg-retro-muted',
      ),
    };
  });

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
