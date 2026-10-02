import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { segmentClasses, segmentedClasses, segmentedGroupName, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import type { Option } from './option';

/**
 * Single-select segmented control: a row of `aria-pressed` buttons under an
 * optional caption, named by `label` or `aria-label`. Bind the selected
 * value with `[(value)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled. With a `name` a hidden input
 * submits the value in native forms. The host is the control's root.
 *
 * @example
 * <pxl-segmented label="View" [options]="views" [(value)]="view" />
 */
@Component({
  selector: 'pxl-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelSegmented)],
  host: {
    '[class]': 'classes().root',
    // These inputs describe the segments and the hidden input; on the host
    // `aria-label` would name a role-less element and the form attributes
    // would mislead form tooling.
    '[attr.aria-label]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
  },
  template: `
    @if (name()) {
      <input type="hidden" [attr.name]="name()" [value]="value() ?? ''" [required]="required()" />
    }
    @if (label()) {
      <p [class]="classes().label">{{ label() }}</p>
    }
    <div [attr.role]="groupName() ? 'group' : null" [attr.aria-label]="groupName() ?? null" [class]="classes().track">
      @for (segment of segments(); track segment.option.value) {
        <button
          type="button"
          [attr.aria-pressed]="segment.active"
          [attr.aria-disabled]="isDisabled()"
          [disabled]="isDisabled()"
          [class]="segment.class"
          (click)="select(segment.option)"
          (blur)="form.touched()"
        >{{ segment.option.label }}</button>
      }
    </div>
  `,
})
export class PixelSegmented implements ControlValueAccessor {
  /** Caption above the segments; omitted when empty. */
  readonly label = input<string>();
  /** Selected value (`[(value)]`); leave unset for an uncontrolled control. */
  readonly value = model<string | undefined>(undefined);
  /** The segments. */
  readonly options = input.required<Option[]>();
  /** Disables every segment. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the selected segment. */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits the value. */
  readonly name = input<string>();
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** Accessible name of the segments when no visible `label` is shown. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly classes = computed(() => segmentedClasses(this.effectiveSurface(), this.isDisabled()));
  /** @internal */
  protected readonly groupName = computed(() => segmentedGroupName(this.ariaLabel(), this.label()));
  /** @internal */
  protected readonly segments = computed(() =>
    this.options().map((option) => {
      const active = this.value() === option.value;
      return {
        option,
        active,
        class: segmentClasses(this.effectiveSurface(), { tone: this.tone(), active, disabled: this.isDisabled() }),
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
