import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { carouselItemClasses, carouselSlideLabel } from '@pxlkit/ui-kit-core';
import { PIXEL_CAROUSEL } from './carousel-context';

/**
 * One slide of a `<pxl-carousel>`: a group (`aria-roledescription="slide"`)
 * named "Slide N of M" by its position, unless it has an `aria-label` of its
 * own. The host is the slide.
 *
 * @example
 * <pxl-carousel-item><img src="/one.png" alt="One" /></pxl-carousel-item>
 */
@Component({
  selector: 'pxl-carousel-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-carousel-item { display: block; } }',
  host: {
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes',
  },
  template: '<ng-content />',
})
export class PixelCarouselItem {
  private readonly context = inject(PIXEL_CAROUSEL, { optional: true });
  private readonly ownLabel = inject(new HostAttributeToken('aria-label'), { optional: true });

  /** @internal */
  protected readonly classes = carouselItemClasses;
  /** @internal An own `aria-label` wins. */
  protected readonly label = computed(() => {
    if (this.ownLabel !== null) return this.ownLabel;
    const items = this.context?.items() ?? [];
    const index = items.indexOf(this);
    return index < 0 ? null : carouselSlideLabel(index, items.length);
  });
}
