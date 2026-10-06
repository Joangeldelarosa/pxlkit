import { Directive } from '@angular/core';
import { parallaxGroupClasses } from '@pxlkit/ui-kit-core';

/**
 * Viewport for parallax layers: it positions and clips the
 * `<pxl-parallax-layer>` and `<pxl-mouse-parallax>` layers inside it, which a
 * mouse parallax measures the cursor across. Put it on a `div`, `section`,
 * `header` or `main` (the counterpart of the React kit's `as` prop).
 *
 * @example
 * <section pxlParallaxGroup class="h-96">…</section>
 */
@Directive({
  selector: '[pxlParallaxGroup]',
  host: { '[class]': 'classes' },
})
export class PixelParallaxGroup {
  /** @internal */
  protected readonly classes = parallaxGroupClasses;
}
