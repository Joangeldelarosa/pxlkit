import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import {
  animationInlineClasses,
  rotateStyle,
  type AnimationDirection,
  type AnimationRepeat,
  type AnimationTrigger,
} from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Full 360° rotation loop in the direction asked for. It plays as `trigger`
 * says and holds still when the user prefers reduced motion. The host is
 * the rotating wrapper.
 *
 * @example
 * <pxl-rotate direction="reverse" [duration]="2400"><span>Reverse</span></pxl-rotate>
 */
@Component({
  selector: 'pxl-rotate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-rotate { display: block; } }',
  host: {
    '[class]': 'classes',
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelRotate {
  /** Animation duration in milliseconds. */
  readonly duration = input(1800, { transform: numberOr(1800) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>('infinite', {
    transform: repeatOr('infinite'),
  });
  /** CSS `animation-direction`. */
  readonly direction = input<AnimationDirection, AnimationDirection | undefined>('normal', {
    transform: withDefault<AnimationDirection>('normal'),
  });
  /** CSS `animation-timing-function`. */
  readonly easing = input<string, string | undefined>('linear', { transform: withDefault('linear') });
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
      ? rotateStyle({
          duration: this.duration(),
          repeat: this.repeat(),
          direction: this.direction(),
          easing: this.easing(),
        })
      : null,
  );
}
