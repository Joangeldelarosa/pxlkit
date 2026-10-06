import { DestroyRef, Directive, computed, effect, inject, input, signal } from '@angular/core';
import { PIXEL_FORM, PIXEL_FORM_FIELD, type PixelFormFieldContext } from './form-context';

/**
 * One field of a `form[pxlForm]`: the control `name` of its group, and the
 * `messages` its errors show — keyed by the validators' error keys
 * (`required`, `pattern`, …), as the React kit's rules carry theirs. Put it
 * on the `<pxl-form-item>` (or an `<ng-container>` around it); its state is
 * there for templates as `#field="pxlFormField"`.
 *
 * @example
 * <pxl-form-item pxlFormField="email" [messages]="{ required: 'Email is required' }">…</pxl-form-item>
 */
@Directive({
  selector: '[pxlFormField]',
  exportAs: 'pxlFormField',
  providers: [{ provide: PIXEL_FORM_FIELD, useFactory: () => inject(PixelFormField).context }],
})
export class PixelFormField {
  /** Name of the field's control in the form's group. */
  readonly name = input.required<string>({ alias: 'pxlFormField' });
  /** The message to show for each error key the control's validators report. */
  readonly messages = input<Record<string, string>>({});

  private readonly form = inject(PIXEL_FORM, { optional: true });
  // Bumped by every event of the control: its validity is no signal.
  private readonly version = signal(0);
  private element: HTMLElement | null = null;

  /** The field's control. */
  readonly control = computed(() => this.form?.group().get(this.name()) ?? null);
  /** The field shows an error: the form was submitted and the control is invalid. */
  readonly invalid = computed(() => {
    this.version();
    return !!this.form?.submitted() && !!this.control()?.invalid;
  });
  /** The message of the error the field shows, if `messages` has one for it. */
  readonly error = computed(() => {
    this.version();
    if (!this.invalid()) return undefined;
    const [key] = Object.keys(this.control()?.errors ?? {});
    return key === undefined ? undefined : this.messages()[key];
  });

  /** @internal Shared with the item's parts. */
  readonly context: PixelFormFieldContext = {
    control: this.control,
    invalid: this.invalid,
    message: this.error,
    setControl: (element) => (this.element = element),
  };

  constructor() {
    const form = this.form;
    if (!form) throw new Error('PixelFormField must be used inside a form[pxlForm].');
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() => this.version.update((version) => version + 1));
      onCleanup(() => subscription?.unsubscribe());
    });
    const unregister = form.register({
      control: this.control,
      focus: () => {
        this.element?.focus();
        return !!this.element;
      },
    });
    inject(DestroyRef).onDestroy(unregister);
  }
}
