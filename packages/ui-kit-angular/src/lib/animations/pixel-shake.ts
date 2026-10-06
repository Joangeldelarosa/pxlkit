import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { animationInlineClasses, shakeStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Quick horizontal shake, for validation errors and attention cues. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * The host is the shaking wrapper.
 *
 * @example
 * <pxl-shake [trigger]="invalid()" (complete)="invalid.set(false)"><span>Wrong password</span></pxl-shake>
 */
@Component({
  selector: 'pxl-shake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-shake { display: block; } }',
  host: {
    '[class]': 'classes',
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelShake {
  /** Animation duration in milliseconds. */
  readonly duration = input(450, { transform: numberOr(450) });
  /** Horizontal travel distance in pixels. */
  readonly distance = input(2, { transform: numberOr(2) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>(1, {
    transform: repeatOr(1),
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
      ? shakeStyle({
          duration: this.duration(),
          distance: this.distance(),
          repeat: this.repeat(),
          easing: this.easing(),
        })
      : null,
  );
}
