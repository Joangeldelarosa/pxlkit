import { Directive, computed, input } from '@angular/core';
import { kbdClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Keyboard key drawn as a keycap, framed and given depth per surface. Put it
 * on a `<kbd>` element.
 *
 * @example
 * <kbd pxlKbd>Ctrl</kbd> <span aria-hidden="true">+</span> <kbd pxlKbd>K</kbd>
 */
@Directive({
  selector: 'kbd[pxlKbd]',
  host: { '[class]': 'classes()' },
})
export class PixelKbd {
  /** Visual surface override. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => kbdClasses(this.effectiveSurface()));
}
