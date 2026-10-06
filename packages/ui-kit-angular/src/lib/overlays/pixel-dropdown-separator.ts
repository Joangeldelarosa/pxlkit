import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { dropdownSeparatorClasses } from '@pxlkit/ui-kit-core';

/** A divider between groups of items in a dropdown menu (`role="separator"`). */
@Component({
  selector: 'pxl-dropdown-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-dropdown-separator { display: block; } }',
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
