import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { formItemClasses, formItemIds } from '@pxlkit/ui-kit-core';
import { injectId } from '../_internal/ids';
import { PIXEL_FORM_ITEM } from './form-context';

/**
 * One item of a `form[pxlForm]`: the stack of a label, a control, a
 * description and a message, which it links with ids of its own — the label
 * points at the control, the control is described by the description and,
 * while the field shows an error, by the message. The host is the stack.
 *
 * @example
 * <pxl-form-item pxlFormField="email">
 *   <label pxlFormLabel>Email</label>
 *   <pxl-input pxlFormControl name="email" />
 *   <pxl-form-message />
 * </pxl-form-item>
 */
@Component({
  selector: 'pxl-form-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-form-item { display: block; } }',
  providers: [{ provide: PIXEL_FORM_ITEM, useFactory: () => inject(PixelFormItem).ids }],
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelFormItem {
  /** @internal The ids of the item's parts. */
  readonly ids = formItemIds(injectId());
  /** @internal */
  protected readonly classes = formItemClasses;
}
