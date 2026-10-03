import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  afterRenderEffect,
  inject,
  input,
} from '@angular/core';
import { createMouseParallaxMotion, mouseParallaxClasses } from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr } from '../_internal/coercion';
import { injectReducedMotion } from '../utilities/media-query';

/**
 * Layer that follows the mouse — or flees it with `invert` — easing towards
 * the cursor's position across the nearest `pxlParallaxGroup` (any element
 * with a `relative` class) or the page, by up to `strength` px. When the
 * user prefers reduced motion it holds still. The host is the layer; the
 * frame loop and the page-wide mouse listener run outside the Angular zone.
 *
 * @example
 * <div pxlParallaxGroup class="h-64">
 *   <pxl-mouse-parallax [strength]="30" invert><span>Boo</span></pxl-mouse-parallax>
 * </div>
 */
@Component({
  selector: 'pxl-mouse-parallax',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-mouse-parallax { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelMouseParallax {
  /** Farthest the layer travels from its place on each axis, in px. */
  readonly strength = input(20, { transform: numberOr(20) });
  /** Move away from the cursor instead of towards it. */
  readonly invert = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly classes = mouseParallaxClasses;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const reducedMotion = injectReducedMotion();
    // Where the layer is and where it heads outlive a change of inputs.
    const motion = createMouseParallaxMotion(host);
    // Browser only: each frame writes the transform straight to the host,
    // so neither the loop nor the mouse listener needs change detection.
    afterRenderEffect((onCleanup) => {
      const options = { strength: this.strength(), invert: this.invert() };
      if (reducedMotion()) return;
      onCleanup(zone.runOutsideAngular(() => motion.follow(options)));
    });
  }
}
