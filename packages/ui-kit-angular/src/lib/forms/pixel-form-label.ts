import { Directive, computed, input } from '@angular/core';
import { formLabelClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectFormItem } from './form-context';

/**
 * The `<label>` of a `<pxl-form-item>`, pointing at its control.
 *
 * @example
 * <label pxlFormLabel>Email</label>
 */
@Directive({
  selector: 'label[pxlFormLabel]',
  host: {
    '[attr.for]': 'item.id',
    '[class]': 'classes()',
  },
})
export class PixelFormLabel {
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly item = injectFormItem('PixelFormLabel');
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => formLabelClasses(this.effectiveSurface()));
}
