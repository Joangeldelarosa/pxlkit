import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { popoverArrowClasses } from '@pxlkit/ui-kit-core';
import { injectPopoverContext } from './popover-context';

/**
 * Decorative arrow inside the popover content, pointing back at the trigger.
 *
 * @example
 * <div *pxlPopoverContent>… <pxl-popover-arrow /></div>
 */
@Component({
  selector: 'pxl-popover-arrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  template: '',
})
export class PixelPopoverArrow {
  private readonly context = injectPopoverContext('PixelPopoverArrow');
  /** @internal */
  protected readonly classes = computed(() => popoverArrowClasses(this.context.surface(), this.context.side()));
}
