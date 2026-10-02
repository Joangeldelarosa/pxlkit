import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import {
  navigationMenuClasses,
  navigationMenuClick,
  navigationMenuFocusIndex,
  navigationMenuIconClasses,
  navigationMenuItemClasses,
  navigationMenuKeyAction,
  navigationMenuLabelClasses,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuPanelEntry,
  navigationMenuPanelId,
  navigationMenuPointerEnter,
  navigationMenuPointerLeave,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
  returnNavigationMenuFocus,
  type NavigationMenuOpen,
  type NavigationMenuOrientation,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * One item of a `<pxl-navigation-menu>`. `icon` and `content` templates
 * receive the item as their context (`let-item`).
 */
export interface PixelNavigationMenuItem {
  label: string;
  /** Link target of an item without `content`, which is then an `<a>`; any other item is a `<button>`. */
  href?: string;
  /** Called when the item is clicked, or activated with Enter or Space. */
  onSelect?: () => void;
  /**
   * Panel content, text or an `<ng-template>`. The item is a button that
   * shows and hides it, and never follows an `href`.
   */
  content?: PxlContent;
  /** Icon before the label, hidden from assistive technology. */
  icon?: PxlContent;
  /** Accepted as in the React kit; the menu does not display it. */
  description?: string;
}

/**
 * Navigation landmark of links and disclosure buttons, in a row or a column,
 * after the WAI-ARIA disclosure navigation pattern: a button shows and hides
 * a panel of content rendered right after it, so Tab moves into the open
 * panel — drawn under its item, or below the whole list (`viewport`). A
 * click (or Enter and Space, natively) toggles a panel; a mouse pointing at
 * an item opens its panel, which closes as the pointer leaves the menu
 * unless a click kept it open. The arrow keys of the orientation move focus
 * round the items, Home and End jump to the ends, ArrowDown on the open
 * button of a row moves into its panel, and Escape closes the panel, focus
 * back on its button. The host is the landmark (`role="navigation"`), named
 * by `ariaLabel`.
 *
 * @example
 * <pxl-navigation-menu [items]="[{ label: 'Home', href: '/' }, { label: 'Products', content: productLinks }]" />
 */
@Component({
  selector: 'pxl-navigation-menu',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes()',
    '(mouseleave)': 'onMouseleave($event)',
  },
  template: `
    <ul [class]="listClasses()">
      @for (row of rows(); track row.item.label + '-' + row.index) {
        <li [class]="itemClasses()">
          @if (row.link) {
            <a
              #trigger
              [attr.href]="row.item.href"
              [class]="row.classes"
              (pointerenter)="onPointerenter($event, row.item, row.index)"
              (keydown)="onKeydown($event, row.index)"
              (click)="onClick(row.item, row.index)"
            >
              @if (row.item.icon) {
                <span aria-hidden="true" [class]="iconClasses">
                  <ng-container *pxlOutlet="row.item.icon; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
                </span>
              }
              <span [class]="labelClasses">{{ row.item.label }}</span>
            </a>
          } @else {
            <button
              #trigger
              type="button"
              [attr.aria-expanded]="row.item.content ? row.expanded : null"
              [attr.aria-controls]="row.item.content ? row.panelId : null"
              [class]="row.classes"
              (pointerenter)="onPointerenter($event, row.item, row.index)"
              (keydown)="onKeydown($event, row.index)"
              (click)="onClick(row.item, row.index)"
            >
              @if (row.item.icon) {
                <span aria-hidden="true" [class]="iconClasses">
                  <ng-container *pxlOutlet="row.item.icon; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
                </span>
              }
              <span [class]="labelClasses">{{ row.item.label }}</span>
            </button>
          }
          <!-- The panel follows its button, so Tab moves into it; the shared viewport is drawn below the whole list all the same. -->
          @if (row.expanded) {
            <div [id]="row.panelId" [class]="panelClasses()" (keydown)="onPanelKeydown($event)">
              <ng-container *pxlOutlet="row.item.content; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
            </div>
          }
        </li>
      }
    </ul>
  `,
})
export class PixelNavigationMenu {
  /** The items, in order. */
  readonly items = input.required<PixelNavigationMenuItem[]>();
  /** Items in a row or a column; also the arrow keys that move between them. */
  readonly orientation = input<NavigationMenuOrientation, NavigationMenuOrientation | undefined>('horizontal', {
    transform: withDefault<NavigationMenuOrientation>('horizontal'),
  });
  /** One shared panel below the list, instead of a panel under each item. */
  readonly viewport = input(true, { transform: booleanOr(true) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible name of the landmark — give each navigation landmark of a page its own. */
  readonly ariaLabel = input<string, string | undefined>('Main navigation', { transform: withDefault('Main navigation') });

  private readonly baseId = injectId();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly open = signal<NavigationMenuOpen | null>(null);
  private readonly triggers = viewChildren<ElementRef<HTMLElement>>('trigger');

  /** @internal */
  protected readonly classes = computed(() => navigationMenuClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly listClasses = computed(() => navigationMenuListClasses(this.orientation()));
  /** @internal */
  protected readonly itemClasses = computed(() => navigationMenuItemClasses(this.viewport()));
  /** @internal The open panel: the shared viewport, or the panel under its item. */
  protected readonly panelClasses = computed(() =>
    this.viewport()
      ? navigationMenuViewportClasses(this.effectiveSurface(), this.orientation())
      : navigationMenuPanelClasses(this.effectiveSurface()),
  );
  /** @internal */
  protected readonly iconClasses = navigationMenuIconClasses;
  /** @internal */
  protected readonly labelClasses = navigationMenuLabelClasses;
  /** @internal */
  protected readonly rows = computed(() =>
    this.items().map((item, index) => {
      const expanded = !!item.content && this.open()?.index === index;
      return {
        item,
        index,
        expanded,
        link: !item.content && !!item.href,
        panelId: navigationMenuPanelId(this.baseId, index),
        classes: navigationMenuTriggerClasses(this.effectiveSurface(), expanded),
      };
    }),
  );

  // Only a mouse opens a panel by pointing: a tap fires the pointer, mouse
  // and focus events of a hover before its click.
  /** @internal */
  protected onPointerenter(event: PointerEvent, item: PixelNavigationMenuItem, index: number): void {
    this.setOpen(navigationMenuPointerEnter(this.open(), index, !!item.content, event.pointerType));
  }

  /** @internal */
  protected onClick(item: PixelNavigationMenuItem, index: number): void {
    if (item.content) this.setOpen(navigationMenuClick(this.open(), index));
    item.onSelect?.();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const action = navigationMenuKeyAction(event.key, this.orientation());
    if (action === undefined) return;
    if (action === 'close') {
      this.close(event);
      return;
    }
    if (action === 'panel') {
      const entry = navigationMenuPanelEntry(event.currentTarget as HTMLElement);
      if (!entry) return;
      event.preventDefault();
      entry.focus();
      return;
    }
    event.preventDefault();
    this.triggers()[navigationMenuFocusIndex(index, action, this.items().length)]?.nativeElement.focus();
  }

  /** @internal */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (navigationMenuKeyAction(event.key, this.orientation()) === 'close') this.close(event);
  }

  /** @internal */
  protected onMouseleave(event: MouseEvent): void {
    if (!event.defaultPrevented) this.setOpen(navigationMenuPointerLeave(this.open()));
  }

  private close(event: KeyboardEvent): void {
    if (!this.open()) return;
    event.preventDefault();
    this.setOpen(null);
  }

  // A panel closing while focus is inside it hands focus to its button.
  private setOpen(next: NavigationMenuOpen | null): void {
    const current = this.open();
    if (current && current.index !== next?.index) returnNavigationMenuFocus(this.triggers()[current.index]?.nativeElement);
    this.open.set(next);
  }
}
