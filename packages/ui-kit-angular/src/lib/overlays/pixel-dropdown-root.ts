import { ChangeDetectionStrategy, Component, inject, input, output, ViewEncapsulation } from '@angular/core';
import { dropdownRootClasses, type Surface } from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectOpenState } from './_internal/open-state';
import { PIXEL_DROPDOWN, createDropdownRoot } from './dropdown-context';

/**
 * Root of a compositional dropdown menu: put a `<pxl-dropdown-trigger>` and a
 * `*pxlDropdownContent` panel of items inside. The open menu takes focus, is
 * named by the trigger and points `aria-activedescendant` at a highlight the
 * arrows move over the enabled items (ArrowDown on the trigger opens the
 * closed menu on the first one, ArrowUp on the last); Home / End jump to the
 * ends, Enter or Space activates the highlighted item and typing jumps to an
 * item by its label. Escape, choosing an item and Tab close the menu with
 * focus back on the trigger; a press outside closes it too, and focus follows
 * the pointer. Bind `[(open)]` to control it, or leave it uncontrolled with
 * `defaultOpen`. Controlled, it shows what its parent binds: every change is
 * only asked for (`(openChange)`), so a parent that keeps its value keeps the
 * menu as it is.
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
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-dropdown-root { display: block; } }',
  providers: [{ provide: PIXEL_DROPDOWN, useFactory: () => inject(PixelDropdownRoot).context }],
  host: { '[class]': 'rootClasses' },
  template: '<ng-content />',
})
export class PixelDropdownRoot {
  /** Whether the menu is open (`[(open)]`); leave unset for an uncontrolled menu. */
  readonly open = input<boolean | undefined>(undefined);
  /** Initial open state while uncontrolled. */
  readonly defaultOpen = input(false, { transform: booleanOr(false) });
  /** Surface override for the trigger and the menu; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Every open state the menu asks for (the trigger and its keys, Escape, a press outside, an item), for `[(open)]`. */
  readonly openChange = output<boolean>();

  private readonly state = injectOpenState(this.open, this.openChange, this.defaultOpen);

  /** @internal */
  protected readonly rootClasses = dropdownRootClasses;
  /** @internal Shared with the trigger, the menu and its items. */
  readonly context = createDropdownRoot({
    open: this.state.open,
    setOpen: (open) => this.state.request(open),
    surface: injectEffectiveSurface(() => this.surface()),
  });
}
