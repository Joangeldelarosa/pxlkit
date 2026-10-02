import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { flickerStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Broken-neon-sign opacity flicker, for retro signage and emphasis. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * The host is the flickering wrapper.
 *
 * @example
 * <pxl-flicker [duration]="900"><span>NEON</span></pxl-flicker>
 */
@Component({
  selector: 'pxl-flicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-flicker { display: block; } }',
  host: {
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelFlicker {
  /** Animation duration in milliseconds. */
  readonly duration = input(2200, { transform: numberOr(2200) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>('infinite', {
    transform: repeatOr('infinite'),
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
      ? flickerStyle({ duration: this.duration(), repeat: this.repeat() })
      : null,
  );
}
