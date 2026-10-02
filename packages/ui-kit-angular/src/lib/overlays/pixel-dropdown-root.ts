import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { dropdownRootClasses, type Surface } from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_DROPDOWN, createDropdownRoot } from './dropdown-context';

/**
 * Root of a compositional dropdown menu: put a `<pxl-dropdown-trigger>` and a
 * `*pxlDropdownContent` panel of items inside. The arrows move a highlight
 * over the enabled items (and open the closed menu on the first one), Home /
 * End jump to the ends, Enter or Space activates the highlighted item, typing
 * jumps to an item by its label, and Escape or a press outside closes the
 * menu. Bind `[(open)]` to control it, or leave it uncontrolled with
 * `defaultOpen`.
 *
 * @example
 * <pxl-dropdown-root>
 *   <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
 *   <div *pxlDropdownContent>
 *     <button pxlDropdownItem value="rename" (selected)="rename()">Rename</button>
 *   </div>
 * </pxl-dropdown-root>
 */
@Component({
  selector: 'pxl-dropdown-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PIXEL_DROPDOWN, useFactory: () => inject(PixelDropdownRoot).context }],
  host: {
    '[class]': 'rootClasses',
    '(keydown)': 'context.onKeydown($event)',
  },
  template: '<ng-content />',
})
export class PixelDropdownRoot {
  /** Whether the menu is open (`[(open)]`); leave unset for an uncontrolled menu. */
  readonly open = model<boolean | undefined>(undefined);
  /** Initial open state while uncontrolled. */
  readonly defaultOpen = input(false, { transform: booleanOr(false) });
  /** Surface override for the trigger and the menu; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  // Like React's uncontrolled state, the default is read once, then kept.
  private seed: boolean | undefined;

  /** @internal */
  protected readonly rootClasses = dropdownRootClasses;
  /** @internal Shared with the trigger, the menu and its items. */
  readonly context = createDropdownRoot({
    open: computed(() => this.open() ?? (this.seed ??= this.defaultOpen())),
    setOpen: (open) => this.open.set(open),
    surface: injectEffectiveSurface(() => this.surface()),
  });
}
