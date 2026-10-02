import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import {
  slideInStyle,
  type AnimationFillMode,
  type AnimationRepeat,
  type AnimationTrigger,
  type SlideInFrom,
} from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Slides its content in from one of the four edges. It plays as `trigger`
 * says and shows the content still when the user prefers reduced motion.
 * The host is the sliding wrapper.
 *
 * @example
 * <pxl-slide-in from="left" [distance]="20"><p>Slides in from the left</p></pxl-slide-in>
 */
@Component({
  selector: 'pxl-slide-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-slide-in { display: block; } }',
  host: {
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelSlideIn {
  /** Edge to slide from. */
  readonly from = input<SlideInFrom, SlideInFrom | undefined>('down', { transform: withDefault<SlideInFrom>('down') });
  /** Animation duration in milliseconds. */
  readonly duration = input(350, { transform: numberOr(350) });
  /** Animation delay in milliseconds. */
  readonly delay = input(0, { transform: numberOr(0) });
  /** Translate distance in pixels. */
  readonly distance = input(10, { transform: numberOr(10) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>(1, {
    transform: repeatOr(1),
  });
  /** CSS `animation-timing-function`. */
  readonly easing = input<string, string | undefined>('ease', { transform: withDefault('ease') });
  /** CSS `animation-fill-mode`. */
  readonly fillMode = input<AnimationFillMode, AnimationFillMode | undefined>('both', {
    transform: withDefault<AnimationFillMode>('both'),
  });
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  readonly trigger = input<AnimationTrigger, AnimationTrigger | undefined>('mount', {
    transform: withDefault<AnimationTrigger>('mount'),
  });
  /** After the final iteration. */
  readonly complete = output<void>();

  /** @internal */
  protected readonly animation = injectAnimationTrigger(
    () => this.trigger(),
    () => this.complete.emit(),
  );
  /** @internal */
  protected readonly style = computed(() =>
    this.animation.active()
      ? slideInStyle({
          from: this.from(),
          duration: this.duration(),
          delay: this.delay(),
          distance: this.distance(),
          repeat: this.repeat(),
          easing: this.easing(),
          fillMode: this.fillMode(),
        })
      : null,
  );
}
