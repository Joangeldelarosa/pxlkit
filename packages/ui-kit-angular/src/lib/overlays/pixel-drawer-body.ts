import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerBodyClasses } from '@pxlkit/ui-kit-core';

/** Scrolling body of a `<pxl-drawer>`. */
@Component({
  selector: 'pxl-drawer-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelDrawerBody {
  /** @internal */
  protected readonly classes = drawerBodyClasses;
}
