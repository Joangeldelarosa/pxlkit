import { ChangeDetectionStrategy, Component } from '@angular/core';
import { dropdownSeparatorClasses } from '@pxlkit/ui-kit-core';

/** A divider between groups of items in a dropdown menu (`role="separator"`). */
@Component({
  selector: 'pxl-dropdown-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    'data-testid': 'dropdown-separator',
    '[class]': 'classes',
  },
  template: '',
})
export class PixelDropdownSeparator {
  /** @internal */
  protected readonly classes = dropdownSeparatorClasses;
}
