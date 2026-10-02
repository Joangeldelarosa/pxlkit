import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { pulseStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Gently scales and dims its content in a recurring pulse, to draw
 * attention. It plays as `trigger` says and holds still when the user
 * prefers reduced motion. The host is the pulsing wrapper.
 *
 * @example
 * <pxl-pulse [duration]="1000"><span>Quick Pulse</span></pxl-pulse>
 */
@Component({
  selector: 'pxl-pulse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-pulse { display: block; } }',
  host: {
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelPulse {
  /** Animation duration in milliseconds. */
  readonly duration = input(2000, { transform: numberOr(2000) });
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
  protected readonly style = computed(() =>
    this.animation.active()
      ? pulseStyle({ duration: this.duration(), repeat: this.repeat(), easing: this.easing() })
      : null,
  );
}
