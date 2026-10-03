import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  ribbonClasses,
  ribbonTilt,
  ribbonTransform,
  type RibbonOffset,
  type RibbonPosition,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { optionalNumber, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Decorative label pinned over the edge of a relatively positioned container
 * (a card): an opaque tone fill on top of the content that never takes the
 * pointer. The corner positions lean 12° outwards unless `tilt` says
 * otherwise. Pair its message with the card's heading: the ribbon itself is
 * plain text. The host is the ribbon.
 *
 * @example
 * <div class="relative">
 *   <pxl-ribbon position="corner-tr" tone="red">Hot</pxl-ribbon>
 * </div>
 */
@Component({
  selector: 'pxl-ribbon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box. In the base layer, so the
  // inline-flex of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-ribbon { display: block; } }',
  host: {
    '[class]': 'classes()',
    // A style map, not `[style.transform]`: beside the `[class]` binding, a
    // style property binding would drop a `transform` the consumer sets.
    '[style]': 'tiltStyle()',
  },
  template: '<ng-content />',
})
export class PixelRibbon {
  /** Where the ribbon sits on its container. */
  readonly position = input<RibbonPosition, RibbonPosition | undefined>('top-center', {
    transform: withDefault<RibbonPosition>('top-center'),
  });
  /** Tone of the opaque fill. */
  readonly tone = input<ToneKey, ToneKey | undefined>('gold', { transform: withDefault<ToneKey>('gold') });
  /** How far a top ribbon rises above the container's edge. */
  readonly offset = input<RibbonOffset, RibbonOffset | undefined>('md', { transform: withDefault<RibbonOffset>('md') });
  /** Tilt in degrees; the corners lean outwards by 12° when unset. */
  readonly tilt = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    ribbonClasses(this.effectiveSurface(), {
      position: this.position(),
      tone: this.tone(),
      offset: this.offset(),
      tilt: this.tilt(),
    }),
  );
  /** @internal A tilt without a Tailwind step is set inline. */
  protected readonly tiltStyle = computed(() => {
    const transform = ribbonTransform(ribbonTilt(this.position(), this.tilt()));
    return transform ? { transform } : null;
  });
}
