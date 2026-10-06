import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { toggleClasses, type Surface } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_TOGGLE_GROUP } from './toggle-group-context';

/**
 * Two-state toggle with `aria-pressed`, applied to a `<button>`. Standalone,
 * bind its state with `[(pressed)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled (starting unpressed). Inside a
 * `<pxl-toggle-group>` the group owns the state and the toggle takes on its
 * size, variant and surface — a radio of a single-select group, with roving
 * focus when the group asks for it.
 *
 * @example
 * <button pxlToggle value="bold" [(pressed)]="bold">Bold</button>
 */
@Component({
  selector: 'button[pxlToggle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelToggle)],
  host: {
    '[attr.type]': 'type()',
    '[attr.role]': 'radio() ? "radio" : null',
    '[attr.aria-checked]': 'radio() ? isPressed() : null',
    '[attr.aria-pressed]': 'radio() ? null : isPressed()',
    '[attr.data-state]': 'isPressed() ? "on" : "off"',
    '[attr.data-pxl-toggle-value]': 'value()',
    // `value` identifies the toggle; as a native button attribute it would submit.
    '[attr.value]': 'null',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.tabindex]': 'tabindex()',
    '[class]': 'classes()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'form.touched()',
  },
  template: '<ng-content />',
})
export class PixelToggle implements ControlValueAccessor {
  /** Identifies the toggle within its group; also exposed as `data-pxl-toggle-value`. */
  readonly value = input.required<string>();
  /** Pressed state of a standalone toggle (`[(pressed)]`); leave unset for an uncontrolled one. */
  readonly pressed = model<boolean | undefined>(undefined);
  /** Surface override; defaults to the group's, then to the nearest provider. */
  readonly surface = input<Surface>();
  /** Native `disabled`. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Native `type`. */
  readonly type = input<string, string | undefined>('button', { transform: withDefault('button') });

  /** @internal */
  protected readonly form = new FormBridge<boolean>();
  private readonly group = inject(PIXEL_TOGGLE_GROUP, { optional: true });
  private readonly ownTabindex = inject(new HostAttributeToken('tabindex'), { optional: true });
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface() ?? this.group?.surface());

  /** @internal */
  protected readonly isPressed = computed(() =>
    this.group ? this.group.isPressed(this.value()) : (this.pressed() ?? false),
  );
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal A single-select group is a radiogroup: its toggles announce "one of N". */
  protected readonly radio = computed(() => this.group?.type() === 'single');
  /** @internal */
  protected readonly tabindex = computed(() => {
    if (!this.group?.rovingFocus()) return this.ownTabindex;
    return this.group.focusedValue() === this.value() ? 0 : -1;
  });
  /** @internal */
  protected readonly classes = computed(() =>
    toggleClasses(this.effectiveSurface(), {
      pressed: this.isPressed(),
      size: this.group?.size() ?? 'md',
      variant: this.group?.variant() ?? 'soft',
    }),
  );

  constructor() {
    const group = this.group;
    if (!group) return;
    const element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
    // Registered once rendered in the browser, like the React toggle's ref.
    afterNextRender(() => group.registerItem(this.value(), element));
    inject(DestroyRef).onDestroy(() => group.unregisterItem(this.value()));
  }

  /** @internal */
  protected onClick(): void {
    if (this.isDisabled()) return;
    if (this.group) {
      this.group.toggle(this.value());
    } else {
      const next = !this.isPressed();
      this.pressed.set(next);
      this.form.changed(next);
    }
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    this.group?.onItemKeydown(event, this.value());
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.pressed.set(value == null ? undefined : Boolean(value));
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
