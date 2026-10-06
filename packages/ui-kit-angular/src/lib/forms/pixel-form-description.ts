import { Directive, computed, input } from '@angular/core';
import { formDescriptionClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectFormItem } from './form-context';

/**
 * The description of a `<pxl-form-item>`, which its control is described by.
 *
 * @example
 * <p pxlFormDescription>Your retro alias.</p>
 */
@Directive({
  selector: 'p[pxlFormDescription]',
  host: {
    '[attr.id]': 'item.descriptionId',
    '[class]': 'classes()',
  },
})
export class PixelFormDescription {
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly item = injectFormItem('PixelFormDescription');
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => formDescriptionClasses(this.effectiveSurface()));
}
