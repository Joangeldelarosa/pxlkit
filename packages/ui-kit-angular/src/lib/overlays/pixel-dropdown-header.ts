import { ChangeDetectionStrategy, Component } from '@angular/core';
import { dropdownHeaderClasses } from '@pxlkit/ui-kit-core';

/** A label over a group of items in a dropdown menu; not an item itself (`role="presentation"`). */
@Component({
  selector: 'pxl-dropdown-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
