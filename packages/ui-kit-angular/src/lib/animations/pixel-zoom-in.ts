import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { zoomInStyle, type AnimationFillMode, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';
import { repeatOr } from './_internal/repeat';

/**
 * Scales its content up from `startScale` to full size while it fades in. It
 * plays as `trigger` says and shows the content still when the user prefers
 * reduced motion. The host is the zooming wrapper.
 *
 * @example
 * <pxl-zoom-in [startScale]="0.6" [duration]="500"><div>Bigger zoom</div></pxl-zoom-in>
 */
@Component({
  selector: 'pxl-zoom-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-zoom-in { display: block; } }',
  host: {
    '[style]': 'style()',
    '(animationend)': 'animation.ended($event)',
  },
  template: '<ng-content />',
})
export class PixelZoomIn {
  /** Animation duration in milliseconds. */
  readonly duration = input(320, { transform: numberOr(320) });
  /** Animation delay in milliseconds. */
  readonly delay = input(0, { transform: numberOr(0) });
  /** Starting `scale()` factor. */
  readonly startScale = input(0.92, { transform: numberOr(0.92) });
  /** Iteration count: a number or `'infinite'`. */
  readonly repeat = input<AnimationRepeat, AnimationRepeat | `${number}` | undefined>(1, {
    transform: repeatOr(1),
  });
  /** CSS `animation-timing-function`. */
  readonly easing = input<string, string | undefined>('cubic-bezier(.2,.9,.2,1)', {
    transform: withDefault('cubic-bezier(.2,.9,.2,1)'),
  });
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
      ? zoomInStyle({
          duration: this.duration(),
          delay: this.delay(),
          startScale: this.startScale(),
          repeat: this.repeat(),
          easing: this.easing(),
          fillMode: this.fillMode(),
        })
      : null,
  );
}
