import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { animationInlineClasses, floatStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Gentle vertical sine loop, for hero badges and floating accents. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * The host is the floating wrapper.
 *
 * @example
 * <pxl-float [distance]="14"><span>Drifting</span></pxl-float>
 */
@Component({
  selector: 'pxl-float',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-float { display: block; } }',
  host: {
    '[class]': 'classes',
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelFloat {
  /** Animation duration in milliseconds. */
  readonly duration = input(2200, { transform: numberOr(2200) });
  /** Vertical travel distance in pixels. */
  readonly distance = input(6, { transform: numberOr(6) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>('infinite', {
    transform: repeatOr('infinite'),
  });
  /** CSS `animation-timing-function`. */
  readonly easing = input<string, string | undefined>('ease-in-out', { transform: withDefault('ease-in-out') });
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
  protected readonly classes = animationInlineClasses;
  /** @internal */
  protected readonly style = computed(() =>
    this.animation.active()
      ? floatStyle({
          duration: this.duration(),
          distance: this.distance(),
          repeat: this.repeat(),
          easing: this.easing(),
        })
      : null,
  );
}
