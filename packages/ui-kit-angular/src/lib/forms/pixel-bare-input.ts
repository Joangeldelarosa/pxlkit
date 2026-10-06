import { Directive, ElementRef, Renderer2, computed, effect, inject, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';

/**
 * Unstyled `<input>` — the escape hatch for fully custom field compositions.
 * Apply it to a native input, which keeps every attribute of its own. Bind
 * its value with `[(value)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled with `defaultValue`.
 *
 * @example
 * <input pxlBareInput aria-label="Search" [(value)]="query" />
 */
@Directive({
  selector: 'input[pxlBareInput]',
  providers: [provideValueAccessor(() => PixelBareInput)],
  host: {
    '(input)': 'onInput()',
    '(blur)': 'form.touched()',
  },
})
export class PixelBareInput implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled input. */
  readonly value = model<string | number | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string | number>();

  /** @internal */
  protected readonly form = new FormBridge<string>();
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  constructor() {
    const current = computed(() => this.value() ?? this.defaultValue());
    // Written only once there is a value: an input left alone keeps its
    // native default (a checkbox's `on`, a range's midpoint).
    effect(() => {
      const value = current();
      if (value !== undefined && this.element.value !== String(value)) {
        this.renderer.setProperty(this.element, 'value', String(value));
      }
    });
  }

  /** @internal */
  protected onInput(): void {
    const value = this.element.value;
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
    this.renderer.setProperty(this.element, 'disabled', disabled);
  }
}
