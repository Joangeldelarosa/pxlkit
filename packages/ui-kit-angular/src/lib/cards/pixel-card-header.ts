import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { cardHeaderClasses } from '@pxlkit/ui-kit-core';

/**
 * Header part of a `<pxl-card>`: a row divided from the body. Projected
 * directly into the card, it takes the place of the title header. The host is
 * the `<header>`.
 */
@Component({
  selector: 'pxl-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <header>: a block box. In the base layer, so
  // the flex row of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-card-header { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelCardHeader {
  /** @internal */
  protected readonly classes = cardHeaderClasses;
}
