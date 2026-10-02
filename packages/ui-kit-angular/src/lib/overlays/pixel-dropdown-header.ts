import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { dropdownHeaderClasses } from '@pxlkit/ui-kit-core';

/** A label over a group of items in a dropdown menu; not an item itself (`role="presentation"`). */
@Component({
  selector: 'pxl-dropdown-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-dropdown-header { display: block; } }',
  host: {
    role: 'presentation',
    'data-testid': 'dropdown-header',
    '[class]': 'classes',
  },
  template: '<ng-content />',
})
export class PixelDropdownHeader {
  /** @internal */
  protected readonly classes = dropdownHeaderClasses;
}
