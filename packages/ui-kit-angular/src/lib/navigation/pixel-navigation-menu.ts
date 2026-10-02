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
  navigationMenuFocusIndex,
  navigationMenuIconClasses,
  navigationMenuIds,
  navigationMenuItemClasses,
  navigationMenuKeyAction,
  navigationMenuLabelClasses,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
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
  /** Link target: the item is an `<a>`; without one it is a `<button>`. */
  href?: string;
  /** Called when the item is clicked, or activated with Enter or Space (a link follows its `href` instead). */
  onSelect?: () => void;
  /** Panel content, which the item opens: text or an `<ng-template>`. */
  content?: PxlContent;
  /** Icon before the label, hidden from assistive technology. */
  icon?: PxlContent;
  /** Accepted as in the React kit; the menu does not display it. */
  description?: string;
}

/**
 * Navigation landmark of links and buttons, in a row or a column, whose items
 * can open a panel of content: one shared panel below the list
 * (`viewport`), or a panel under each item. Pointing at or focusing an item
 * opens its panel and leaving the menu closes it; the arrow keys of the
 * orientation move focus round the items, Home and End jump to the ends,
 * Escape closes the panel and Enter or Space toggles it. The host is the
 * landmark (`role="navigation"`), named by `ariaLabel`.
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
    <ul role="menubar" [attr.aria-orientation]="orientation()" [class]="listClasses()">
      @for (row of rows(); track row.item.label + '-' + row.index) {
        <li role="none" [class]="itemClasses">
          @if (row.item.href) {
            <a
              #trigger
              [attr.href]="row.item.href"
              [id]="row.ids.trigger"
              role="menuitem"
              tabindex="0"
              [attr.aria-haspopup]="row.item.content ? 'menu' : null"
              [attr.aria-expanded]="row.item.content ? row.expanded : null"
              [attr.aria-controls]="row.expanded ? row.ids.panel : null"
              [class]="row.classes"
              (mouseenter)="onMouseenter(row.item, row.index)"
              (focus)="onFocus(row.item, row.index)"
              (keydown)="onKeydown($event, row.item, row.index)"
              (click)="onClick($event, row.item, row.index)"
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
              [id]="row.ids.trigger"
              role="menuitem"
              tabindex="0"
              [attr.aria-haspopup]="row.item.content ? 'menu' : null"
              [attr.aria-expanded]="row.item.content ? row.expanded : null"
              [attr.aria-controls]="row.expanded ? row.ids.panel : null"
              [class]="row.classes"
              (mouseenter)="onMouseenter(row.item, row.index)"
              (focus)="onFocus(row.item, row.index)"
              (keydown)="onKeydown($event, row.item, row.index)"
              (click)="onClick($event, row.item, row.index)"
            >
              @if (row.item.icon) {
                <span aria-hidden="true" [class]="iconClasses">
                  <ng-container *pxlOutlet="row.item.icon; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
                </span>
              }
              <span [class]="labelClasses">{{ row.item.label }}</span>
            </button>
          }
          @if (!viewport() && row.expanded) {
            <div [id]="row.ids.panel" role="menu" [attr.aria-labelledby]="row.ids.trigger" [class]="panelClasses()">
              <ng-container *pxlOutlet="row.item.content; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
            </div>
          }
        </li>
      }
    </ul>
    @if (viewportPanel(); as panel) {
      <div [id]="panel.ids.panel" role="menu" [attr.aria-labelledby]="panel.ids.trigger" [class]="viewportClasses()">
        <ng-container *pxlOutlet="panel.item.content; context: { $implicit: panel.item }; let text">{{ text }}</ng-container>
      </div>
    }
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
  private readonly active = signal<number | null>(null);
  private readonly triggers = viewChildren<ElementRef<HTMLElement>>('trigger');

  /** @internal */
  protected readonly classes = computed(() => navigationMenuClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly listClasses = computed(() => navigationMenuListClasses(this.orientation()));
  /** @internal */
  protected readonly panelClasses = computed(() => navigationMenuPanelClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly viewportClasses = computed(() =>
    navigationMenuViewportClasses(this.effectiveSurface(), this.orientation()),
  );
  /** @internal */
  protected readonly itemClasses = navigationMenuItemClasses;
  /** @internal */
  protected readonly iconClasses = navigationMenuIconClasses;
  /** @internal */
  protected readonly labelClasses = navigationMenuLabelClasses;
  /** @internal */
  protected readonly rows = computed(() =>
    this.items().map((item, index) => {
      const expanded = this.active() === index && !!item.content;
      return {
        item,
        index,
        expanded,
        ids: navigationMenuIds(this.baseId, index),
        classes: navigationMenuTriggerClasses(this.effectiveSurface(), expanded),
      };
    }),
  );
  /** @internal The shared panel, while an item with content is open. */
  protected readonly viewportPanel = computed(() => {
    const index = this.active();
    const item = index === null ? undefined : this.items()[index];
    return this.viewport() && index !== null && item?.content ? { item, ids: navigationMenuIds(this.baseId, index) } : null;
  });

  /** @internal */
  protected onMouseenter(item: PixelNavigationMenuItem, index: number): void {
    this.active.set(item.content ? index : null);
  }

  /** @internal */
  protected onFocus(item: PixelNavigationMenuItem, index: number): void {
    if (item.content) this.active.set(index);
  }

  /** @internal */
  protected onClick(event: MouseEvent, item: PixelNavigationMenuItem, index: number): void {
    item.onSelect?.();
    if (!item.content) return;
    // A link with a panel toggles it instead of navigating.
    if (item.href) event.preventDefault();
    this.toggle(index);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent, item: PixelNavigationMenuItem, index: number): void {
    const action = navigationMenuKeyAction(event.key, this.orientation());
    if (action === undefined) return;
    if (action === 'activate') {
      // Links handle Enter natively: the browser follows them.
      if (item.href) return;
      event.preventDefault();
      if (item.content) this.toggle(index);
      item.onSelect?.();
      return;
    }
    event.preventDefault();
    if (action === 'close') this.active.set(null);
    else this.triggers()[navigationMenuFocusIndex(index, action, this.items().length)]?.nativeElement.focus();
  }

  /** @internal */
  protected onMouseleave(event: MouseEvent): void {
    if (!event.defaultPrevented) this.active.set(null);
  }

  private toggle(index: number): void {
    this.active.update((current) => (current === index ? null : index));
  }
}
