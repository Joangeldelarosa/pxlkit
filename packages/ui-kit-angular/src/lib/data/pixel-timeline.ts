import { Directive, contentChildren, inject, input } from '@angular/core';
import {
  timelineClasses,
  type PixelTimelineAlign,
  type PixelTimelineBulletSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { optionalNumber, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelTimelineItem } from './pixel-timeline-item';
import { PIXEL_TIMELINE, type PixelTimelineContext } from './timeline-context';

/**
 * Vertical timeline on an `<ol>`, whose `li[pxlTimelineItem]` entries are
 * past, active (`aria-current="step"`) or upcoming from `active`.
 *
 * @example
 * <ol pxlTimeline [active]="1">
 *   <li pxlTimelineItem label="Order placed" time="09:00" description="Confirmation email sent."></li>
 *   <li pxlTimelineItem label="Packed" time="11:20"></li>
 * </ol>
 */
@Directive({
  selector: 'ol[pxlTimeline]',
  providers: [{ provide: PIXEL_TIMELINE, useFactory: () => inject(PixelTimeline).context }],
  host: { '[class]': 'classes' },
})
export class PixelTimeline {
  /** Index of the current entry: the ones before it are past, the ones after it upcoming. */
  readonly active = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Bullet size. */
  readonly bulletSize = input<PixelTimelineBulletSize, PixelTimelineBulletSize | undefined>('md', {
    transform: withDefault<PixelTimelineBulletSize>('md'),
  });
  /** Side the bullets and the rail sit on. */
  readonly align = input<PixelTimelineAlign, PixelTimelineAlign | undefined>('left', {
    transform: withDefault<PixelTimelineAlign>('left'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly classes = timelineClasses;
  private readonly entries = contentChildren(PixelTimelineItem);

  /** @internal Shared with the entries. */
  readonly context: PixelTimelineContext = {
    active: this.active,
    bulletSize: this.bulletSize,
    align: this.align,
    surface: injectEffectiveSurface(() => this.surface()),
    entries: this.entries,
  };
}
