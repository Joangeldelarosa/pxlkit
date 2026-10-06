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
import { followScroll, parallaxLayerClasses, type ParallaxAxis } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectReducedMotion } from '../utilities/media-query';

/**
 * Layer that moves with the scroll, faster or slower than the page: on every
 * animation frame it is translated by its distance from the viewport's
 * centre times `speed` — 0 holds it in place, 0.5 gives a far background, a
 * negative speed a foreground that floats the other way. When the user
 * prefers reduced motion it holds still. The host is the layer; the frame
 * loop runs outside the Angular zone.
 *
 * @example
 * <pxl-parallax-layer [speed]="0.5"><img src="/sky.png" alt="" /></pxl-parallax-layer>
 */
@Component({
  selector: 'pxl-parallax-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-parallax-layer { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelParallaxLayer {
  /** Multiplier of the scroll: 0 holds the layer in place, 1 moves it at scroll speed, a negative one reverses it. */
  readonly speed = input(0.5, { transform: numberOr(0.5) });
  /** Axis the layer moves along. */
  readonly axis = input<ParallaxAxis, ParallaxAxis | undefined>('y', { transform: withDefault<ParallaxAxis>('y') });

  /** @internal */
  protected readonly classes = parallaxLayerClasses;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const reducedMotion = injectReducedMotion();
    // Browser only: each frame writes the transform straight to the host,
    // so the loop never needs change detection.
    afterRenderEffect((onCleanup) => {
      const options = { speed: this.speed(), axis: this.axis() };
      if (reducedMotion()) return;
      onCleanup(zone.runOutsideAngular(() => followScroll(host, options)));
    });
  }
}
