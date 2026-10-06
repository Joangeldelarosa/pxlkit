import { Directive, ElementRef, Renderer2, computed, effect, inject, input, model } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';

/**
 * Unstyled `<textarea>` — the escape hatch for custom multi-line inputs
 * without the `pxl-textarea` chrome. Apply it to a native textarea, which
 * keeps every attribute of its own. Bind its value with `[(value)]`, use it as
 * a form control (`ngModel`, `formControlName`), or leave it uncontrolled
 * with `defaultValue`.
 *
 * @example
 * <textarea pxlBareTextarea rows="4" aria-label="Notes" [(value)]="notes"></textarea>
 */
@Directive({
  selector: 'textarea[pxlBareTextarea]',
  providers: [provideValueAccessor(() => PixelBareTextarea)],
  host: {
    '(input)': 'onInput()',
    '(blur)': 'form.touched()',
  },
})
export class PixelBareTextarea implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled textarea. */
  readonly value = model<string | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string>();

  /** @internal */
  protected readonly form = new FormBridge<string>();
  private readonly element = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  constructor() {
    const current = computed(() => this.value() ?? this.defaultValue());
    effect(() => {
      const value = current();
      if (value !== undefined && this.element.value !== value) {
        this.renderer.setProperty(this.element, 'value', value);
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
