import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  SPINNER_DEFAULT_LABEL,
  spinnerAnimation,
  spinnerClasses,
  type SpinnerSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectReducedMotion } from '../utilities/media-query';

/**
 * Compact loading indicator: a square blade turning in eight steps on the
 * pixel surface, a smoothly spinning ring on the linear one — frozen when the
 * user prefers reduced motion. It is a `role="status"` region named by
 * `label` (also visually hidden text), or pure decoration with `decorative`.
 * The host is the indicator.
 *
 * @example
 * <pxl-spinner size="lg" tone="cyan" label="Loading results" />
 */
@Component({
  selector: 'pxl-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // role=status already implies aria-live=polite, so it is not repeated.
    '[attr.role]': 'decorative() ? null : "status"',
    '[attr.aria-label]': 'decorative() ? null : label()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[class]': 'classes().root',
  },
  template: `
    <span data-pxl-spinner-blade="true" aria-hidden="true" [class]="classes().blade" [style.animation]="animation()"></span>
    @if (!decorative()) {
      <span class="sr-only">{{ label() }}</span>
    }
  `,
})
export class PixelSpinner {
  /** Box size. */
  readonly size = input<SpinnerSize, SpinnerSize | undefined>('md', { transform: withDefault<SpinnerSize>('md') });
  /** Accessible name. */
  readonly label = input<string, string | undefined>(SPINNER_DEFAULT_LABEL, { transform: withDefault(SPINNER_DEFAULT_LABEL) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Colour. */
  readonly tone = input<ToneKey, ToneKey | undefined>('cyan', { transform: withDefault<ToneKey>('cyan') });
  /**
   * Pure decoration (`aria-hidden`, no role, no label), for a parent that
   * already announces its busy state (a button with `aria-busy="true"`). A
   * standalone spinner needs `aria-busy="true"` on the container that loads.
   */
  readonly decorative = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly reducedMotion = injectReducedMotion();
  /** @internal */
  protected readonly classes = computed(() => spinnerClasses(this.effectiveSurface(), this.size(), this.tone()));
  /** @internal */
  protected readonly animation = computed(() =>
    spinnerAnimation(this.effectiveSurface(), { reducedMotion: this.reducedMotion() }),
  );
}
