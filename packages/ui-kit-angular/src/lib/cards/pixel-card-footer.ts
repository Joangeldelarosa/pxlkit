import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { cardFooterClasses } from '@pxlkit/ui-kit-core';

/** Footer part of a `<pxl-card>`, divided from the body and pushed to the bottom. The host is the `<footer>`. */
@Component({
  selector: 'pxl-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <footer>: a block box, as its classes set no
  // display. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-card-footer { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelCardFooter {
  /** @internal */
  protected readonly classes = cardFooterClasses;
}
