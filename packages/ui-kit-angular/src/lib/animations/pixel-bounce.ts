import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { animationInlineClasses, bounceStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Vertical bounce with damped follow-through, for any inline content. It
 * plays as `trigger` says and holds still when the user prefers reduced
 * motion. The host is the bouncing wrapper.
 *
 * @example
 * <pxl-bounce trigger="hover" [repeat]="1"><span>Hover me</span></pxl-bounce>
 */
@Component({
  selector: 'pxl-bounce',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-bounce { display: block; } }',
  host: {
    '[class]': 'classes',
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelBounce {
  /** Animation duration in milliseconds. */
  readonly duration = input(800, { transform: numberOr(800) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>('infinite', {
    transform: repeatOr('infinite'),
  });
  /** Peak bounce height in pixels. */
  readonly height = input(8, { transform: numberOr(8) });
  /** CSS `animation-timing-function`. */
  readonly easing = input<string, string | undefined>('ease', { transform: withDefault('ease') });
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
      ? bounceStyle({ duration: this.duration(), repeat: this.repeat(), height: this.height(), easing: this.easing() })
      : null,
  );
}
