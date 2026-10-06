import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { cardBodyClasses } from '@pxlkit/ui-kit-core';

/** Body part of a `<pxl-card>`, which takes the height left over. */
@Component({
  selector: 'pxl-card-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, as its classes set no
  // display. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-card-body { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelCardBody {
  /** @internal */
  protected readonly classes = cardBodyClasses;
}
