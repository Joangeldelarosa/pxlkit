import { DestroyRef, Directive, ElementRef, Renderer2, effect, inject, signal, type AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { formControlDescribedBy } from '@pxlkit/ui-kit-core';
import { bindValueAccessor } from './_internal/bind-value-accessor';
import { PIXEL_FORM_FIELD, injectFormItem } from './form-context';

/** Elements that are a control of their own. */
const CONTROL_ELEMENTS = new Set(['input', 'select', 'textarea', 'button']);

/** The control a host stands for: itself if it is one, else the first control inside it. */
function controlOf(host: HTMLElement): HTMLElement {
  if (CONTROL_ELEMENTS.has(host.tagName.toLowerCase())) return host;
  return host.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea, button, [tabindex]') ?? host;
}

/**
 * The control of a `<pxl-form-item>`, on a form control component (any
 * `ControlValueAccessor`, as the kit's fields are): binds it to its field's
 * `FormControl`, and gives the native control inside it — the `<input>` of
 * a `<pxl-input>` — the item's control `id`, `aria-describedby` (the
 * description, and the message while the field shows an error) and
 * `aria-invalid` while it does. The label points at it, and a submission
 * with errors focuses it.
 *
 * @example
 * <pxl-input pxlFormControl name="email" type="email" />
 */
@Directive({ selector: '[pxlFormControl]' })
export class PixelFormControl implements AfterViewInit {
  private readonly item = injectFormItem('PixelFormControl');
  private readonly field = inject(PIXEL_FORM_FIELD, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly target = signal<HTMLElement | null>(null);

  constructor() {
    const field = this.field;
    const accessor = inject(NG_VALUE_ACCESSOR, { self: true, optional: true })?.[0];
    if (field && accessor) {
      effect((onCleanup) => {
        const control = field.control();
        if (control) onCleanup(bindValueAccessor(control, accessor));
      });
    }
    // The control's view sets its own id first; these attributes follow it.
    effect(() => {
      const target = this.target();
      if (!target) return;
      const invalid = this.field?.invalid() ?? false;
      this.renderer.setAttribute(target, 'id', this.item.id);
      this.renderer.setAttribute(target, 'aria-describedby', formControlDescribedBy(this.item, invalid));
      if (invalid) this.renderer.setAttribute(target, 'aria-invalid', 'true');
      else this.renderer.removeAttribute(target, 'aria-invalid');
    });
    inject(DestroyRef).onDestroy(() => this.field?.setControl(null));
  }

  ngAfterViewInit(): void {
    const target = controlOf(this.host);
    this.target.set(target);
    this.field?.setControl(target);
  }
}
