import { signal, type Provider, type Type, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

/**
 * `NG_VALUE_ACCESSOR` provider for a form control component, so it works
 * with `ngModel`, `formControl` and `formControlName`.
 */
export function provideValueAccessor(component: () => Type<ControlValueAccessor>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(component), multi: true };
}

/**
 * The Angular Forms side of a form control: the callbacks Angular registers
 * and the disabled state it sets. The component keeps its own `model()` as
 * the single source of its value and reports user changes through
 * `changed()`.
 */
export class FormBridge<T> {
  /** Disabled by the form (`FormControl.disable()`, `[disabled]` on `ngModel`). */
  readonly disabled = signal(false);
  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  /** Report a value the user chose. */
  changed(value: T): void {
    this.onChange(value);
  }

  /** Report that the user left the control. */
  touched(): void {
    this.onTouched();
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
