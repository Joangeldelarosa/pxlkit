import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  toggleGroupClasses,
  toggleGroupEmptyValue,
  toggleGroupIsPressed,
  toggleGroupKeyMove,
  toggleGroupMoveTarget,
  toggleGroupRole,
  toggleGroupToggle,
  type Surface,
  type ToggleGroupSize,
  type ToggleGroupType,
  type ToggleGroupVariant,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_TOGGLE_GROUP, type PixelToggleGroupContext } from './toggle-group-context';

/**
 * A row of `button[pxlToggle]`s sharing one value. In single mode (the
 * default) it is a radiogroup and its toggles are radios — pressing the
 * pressed one unsets it; in multiple mode its toggles are pressed buttons,
 * the row a group when it has a name. Bind the value with `[(value)]` (a
 * string, or an array in multiple mode), use it as a form control
 * (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`. With `rovingFocus` only one toggle is in the tab order, and
 * the arrow keys, Home and End move between them. The host is the row.
 *
 * @example
 * <pxl-toggle-group [(value)]="alignment" aria-label="Text alignment">
 *   <button pxlToggle value="left">Left</button>
 *   <button pxlToggle value="right">Right</button>
 * </pxl-toggle-group>
 */
@Component({
  selector: 'pxl-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-toggle-group { display: block; } }',
  providers: [
    { provide: PIXEL_TOGGLE_GROUP, useFactory: () => inject(PixelToggleGroup).context },
    provideValueAccessor(() => PixelToggleGroup),
  ],
  host: {
    '[attr.role]': 'role()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '[class]': 'classes',
    '(focusout)': 'form.touched()',
  },
  template: '<ng-content />',
})
export class PixelToggleGroup implements ControlValueAccessor {
  /** `single`: one value, a radiogroup of radios; `multiple`: any number of values, pressed buttons. */
  readonly type = input<ToggleGroupType, ToggleGroupType | undefined>('single', {
    transform: withDefault<ToggleGroupType>('single'),
  });
  /** Value (`[(value)]`): a string in single mode (`''` for none), an array in multiple mode; leave unset for an uncontrolled group. */
  readonly value = model<string | string[] | undefined>(undefined);
  /** Initial value while uncontrolled; nothing pressed by default. */
  readonly defaultValue = input<string | string[]>();
  /** Only one toggle is in the tab order; the arrow keys, Home and End move between them. */
  readonly rovingFocus = input(false, { transform: booleanOr(false) });
  /** The arrow keys wrap from the last toggle to the first and back. */
  readonly loop = input(false, { transform: booleanOr(false) });
  /** Size of the toggles. */
  readonly size = input<ToggleGroupSize, ToggleGroupSize | undefined>('md', { transform: withDefault<ToggleGroupSize>('md') });
  /** Variant of the toggles. */
  readonly variant = input<ToggleGroupVariant, ToggleGroupVariant | undefined>('soft', {
    transform: withDefault<ToggleGroupVariant>('soft'),
  });
  /** Surface of the toggles; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible name of the group. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Id of the element that names the group. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @internal */
  protected readonly form = new FormBridge<string | string[]>();
  /** @internal */
  protected readonly classes = toggleGroupClasses;
  /** @internal */
  protected readonly role = computed(() => toggleGroupRole(this.type(), !!(this.ariaLabel() || this.ariaLabelledby())));

  // Like React's uncontrolled state, the default is read once, then kept.
  private seed: string | string[] | undefined;
  private readonly current = computed(
    () => this.value() ?? (this.seed ??= this.defaultValue() ?? toggleGroupEmptyValue(this.type())),
  );
  private readonly items = new Map<string, HTMLButtonElement>();
  private order: string[] = [];
  private readonly focusedValue = signal<string | null>(null);
  /** Toggles the form disabled, to enable again with it: a toggle's own `disabled` is left alone. */
  private readonly disabledByForm = new Set<HTMLButtonElement>();

  /** @internal Shared with the toggles. */
  readonly context: PixelToggleGroupContext = {
    type: this.type,
    size: this.size,
    variant: this.variant,
    surface: injectEffectiveSurface(() => this.surface()),
    rovingFocus: this.rovingFocus,
    focusedValue: this.focusedValue.asReadonly(),
    isPressed: (item) => toggleGroupIsPressed(this.type(), this.current(), item),
    toggle: (item) => {
      if (this.form.disabled()) return;
      const next = toggleGroupToggle(this.type(), this.current(), item);
      this.value.set(next);
      this.form.changed(next);
    },
    registerItem: (item, element) => {
      this.items.set(item, element);
      if (!this.order.includes(item)) this.order.push(item);
      // The first toggle holds the tab stop until the arrow keys move it.
      if (this.focusedValue() === null) this.focusedValue.set(item);
      if (this.form.disabled()) this.disable(element, true);
    },
    unregisterItem: (item) => {
      const element = this.items.get(item);
      if (element) this.disabledByForm.delete(element);
      this.items.delete(item);
      this.order = this.order.filter((other) => other !== item);
      if (this.focusedValue() === item) this.focusedValue.set(this.order[0] ?? null);
    },
    onItemKeydown: (event, item) => {
      const move = toggleGroupKeyMove(event.key);
      if (move === undefined) return;
      event.preventDefault();
      const next = toggleGroupMoveTarget(this.order, item, move, this.loop());
      if (next === undefined) return;
      const element = this.items.get(next);
      if (!element) return;
      this.focusedValue.set(next);
      element.focus();
    },
  };

  private disable(element: HTMLButtonElement, disabled: boolean): void {
    if (disabled && !element.disabled) {
      element.disabled = true;
      this.disabledByForm.add(element);
    } else if (!disabled && this.disabledByForm.delete(element)) {
      element.disabled = false;
    }
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' || Array.isArray(value) ? value : undefined);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: string | string[]) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
    for (const element of this.items.values()) this.disable(element, disabled);
  }
}
