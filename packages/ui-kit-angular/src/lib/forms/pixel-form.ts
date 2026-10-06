import { Directive, computed, inject, input, output, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { formClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_FORM, type PixelFormContext, type PixelFormFieldEntry } from './form-context';

/**
 * Validated form on Angular reactive forms: give the `<form>` its
 * `FormGroup` — validators live on its controls — and compose
 * `[pxlFormField]`, `<pxl-form-item>`, `label[pxlFormLabel]`,
 * `[pxlFormControl]`, `p[pxlFormDescription]` and `<pxl-form-message>`
 * inside. The parts bind the controls themselves: no `formGroup` or
 * `formControlName` (whose status classes the React kit does not render).
 * Submitting shows every field's error and focuses the first field with
 * one; without errors, `(submitted)` emits the form's value. After the first
 * submission errors follow the values as they change, never blur.
 *
 * @example
 * <form [pxlForm]="form" (submitted)="save($event)">…</form>
 */
@Directive({
  selector: 'form[pxlForm]',
  exportAs: 'pxlForm',
  providers: [{ provide: PIXEL_FORM, useFactory: () => inject(PixelForm).context }],
  host: {
    novalidate: '',
    '[class]': 'classes()',
    '(submit)': 'onSubmit($event)',
  },
})
export class PixelForm<TGroup extends FormGroup = FormGroup> {
  /** The form's model. */
  readonly group = input.required<TGroup>({ alias: 'pxlForm' });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** The form's value, once a submission finds no error (pending validators are waited for). */
  readonly submitted = output<TGroup['value']>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => formClasses(this.effectiveSurface()));
  private readonly wasSubmitted = signal(false);
  private readonly fields: PixelFormFieldEntry[] = [];

  /** @internal Shared with the fields. */
  readonly context: PixelFormContext = {
    group: this.group,
    submitted: this.wasSubmitted.asReadonly(),
    register: (field) => {
      this.fields.push(field);
      return () => {
        const index = this.fields.indexOf(field);
        if (index >= 0) this.fields.splice(index, 1);
      };
    },
  };

  /** Resets the form's values (to `value`, or the initial ones) and hides its errors until the next submission. */
  reset(value?: unknown): void {
    this.group().reset(value);
    this.wasSubmitted.set(false);
  }

  /** @internal */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.wasSubmitted.set(true);
    const group = this.group();
    if (!group.pending) {
      this.settle(group);
      return;
    }
    const subscription = group.statusChanges.subscribe((status) => {
      if (status === 'PENDING') return;
      subscription.unsubscribe();
      this.settle(group);
    });
  }

  private settle(group: TGroup): void {
    if (!group.invalid) {
      this.submitted.emit(group.value);
      return;
    }
    // The first field with an error that has a control takes focus.
    for (const field of this.fields) {
      if (field.control()?.invalid && field.focus()) return;
    }
  }
}
