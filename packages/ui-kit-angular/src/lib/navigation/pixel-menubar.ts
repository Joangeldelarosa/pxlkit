import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  MENUBAR_SUBMENU_ARROW,
  menubarClasses,
  menubarHasSubmenu,
  menubarHighlight,
  menubarIds,
  menubarItemClasses,
  menubarItemIconClasses,
  menubarItemLabelClasses,
  menubarItemSlotClasses,
  menubarKeyAction,
  menubarMenuClasses,
  menubarSeparatorClasses,
  menubarShortcutClasses,
  menubarSubmenuArrowClasses,
  menubarSubmenuClasses,
  menubarSubmenuLabel,
  menubarTabStop,
  menubarTriggerClasses,
  menubarTriggerSlotClasses,
  type MenubarMove,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectClickOutside } from '../utilities/dom';

/** An item of a `<pxl-menubar>` menu. An `icon` template receives the item as its context (`let-item`). */
export interface PixelMenubarItem {
  /** Identity of the item. */
  value: string;
  label: string;
  /** Icon before the label: text or an `<ng-template>`. */
  icon?: PxlContent;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
  /** Called when the item is chosen; the menu closes. */
  onSelect?: () => void;
  /** Items of a submenu that the item opens. */
  submenu?: PixelMenubarItem[];
  /** Draws a separator in place of an item. */
  separator?: boolean;
  /** Skipped by the keyboard and ignores the pointer. */
  disabled?: boolean;
}

/** A top-level menu of a `<pxl-menubar>`. */
export interface PixelMenubarMenu {
  /** Label of the menu button. */
  label: string;
  items: PixelMenubarItem[];
}

/**
 * Application menubar of menu buttons, each opening a menu of actions with
 * icons, shortcut hints, separators, disabled items and submenus. The open
 * menu takes focus and points `aria-activedescendant` at the highlighted
 * item: Up and Down move round the enabled items (on a closed button they
 * open its menu on the first or last one), Home and End jump to the ends,
 * Right enters a submenu and Left leaves it, Left and Right switch menus,
 * Enter and Space choose. Escape closes the submenu, then the menu, with
 * focus back on its button; choosing an item and Tab close it too. Pointing
 * at another button while a menu is open switches to its menu; a press
 * outside closes it. The host is the menubar (`role="menubar"`).
 *
 * @example
 * <pxl-menubar [menus]="[{ label: 'File', items: [{ value: 'new', label: 'New', shortcut: 'Ctrl+N' }] }]" />
 */
@Component({
  selector: 'pxl-menubar',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menubar',
    'aria-orientation': 'horizontal',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (menu of menus(); track menu.label + '-' + $index; let m = $index) {
      <div [class]="triggerSlotClasses">
        <button
          #trigger
          [id]="ids.trigger(m)"
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          [attr.aria-expanded]="openMenu() === m"
          [attr.aria-controls]="openMenu() === m ? ids.menu(m) : null"
          [attr.tabindex]="m === tabStop() ? 0 : -1"
          [class]="triggerClasses(m)"
          (focus)="lastTrigger.set(m)"
          (click)="onTriggerClick(m)"
          (mouseenter)="onTriggerMouseenter(m)"
        >{{ menu.label }}</button>
        @if (openMenu() === m) {
          <div
            #panel
            [id]="ids.menu(m)"
            role="menu"
            tabindex="-1"
            [attr.aria-labelledby]="ids.trigger(m)"
            [attr.aria-activedescendant]="activeDescendant(m)"
            [class]="menuClasses()"
          >
            @for (item of menu.items; track item.separator ? 'sep-' + $index : item.value; let i = $index) {
              @if (item.separator) {
                <div role="separator" [class]="separatorClasses"></div>
              } @else {
                <div [class]="itemSlotClasses" (mouseenter)="onItemMouseenter(item, i)">
                  <div
                    [id]="ids.item(m, i)"
                    role="menuitem"
                    [attr.aria-disabled]="item.disabled || null"
                    [attr.aria-haspopup]="hasSubmenu(item) ? 'menu' : null"
                    [attr.aria-expanded]="hasSubmenu(item) ? openSubmenuItem() === i : null"
                    tabindex="-1"
                    [class]="itemClasses(activeItem() === i, item.disabled)"
                    (click)="activate(item)"
                  >
                    @if (item.icon) {
                      <span [class]="itemIconClasses">
                        <ng-container *pxlOutlet="item.icon; context: { $implicit: item }; let text">{{ text }}</ng-container>
                      </span>
                    }
                    <span [class]="itemLabelClasses">{{ item.label }}</span>
                    @if (item.shortcut) {
                      <kbd [class]="shortcutClasses()">{{ item.shortcut }}</kbd>
                    }
                    @if (hasSubmenu(item)) {
                      <span aria-hidden="true" [class]="submenuArrowClasses">{{ submenuArrow }}</span>
                    }
                  </div>
                  @if (hasSubmenu(item) && openSubmenuItem() === i) {
                    <div role="menu" [attr.aria-label]="submenuLabel(item.label)" [class]="submenuClasses()">
                      @for (sub of item.submenu ?? []; track sub.separator ? 'sub-sep-' + $index : sub.value; let s = $index) {
                        @if (sub.separator) {
                          <div role="separator" [class]="separatorClasses"></div>
                        } @else {
                          <div
                            [id]="ids.subitem(m, i, s)"
                            role="menuitem"
                            [attr.aria-disabled]="sub.disabled || null"
                            tabindex="-1"
                            [class]="itemClasses(activeSubItem() === s, sub.disabled, true)"
                            (mouseenter)="onSubItemMouseenter(sub, s)"
                            (click)="onSubItemClick($event, sub)"
                          >
                            @if (sub.icon) {
                              <span [class]="itemIconClasses">
                                <ng-container *pxlOutlet="sub.icon; context: { $implicit: sub }; let text">{{ text }}</ng-container>
                              </span>
                            }
                            <span [class]="itemLabelClasses">{{ sub.label }}</span>
                          </div>
                        }
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        }
      </div>
    }
  `,
})
export class PixelMenubar {
  /** The menus, in order. */
  readonly menus = input.required<PixelMenubarMenu[]>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly ids = menubarIds(injectId());
  /** @internal */
  protected readonly openMenu = signal<number | null>(null);
  /** @internal */
  protected readonly activeItem = signal(-1);
  /** @internal */
  protected readonly openSubmenuItem = signal<number | null>(null);
  /** @internal */
  protected readonly activeSubItem = signal(-1);
  /** @internal The button that last had focus or a menu open keeps the tab stop. */
  protected readonly lastTrigger = signal(0);
  /** @internal */
  protected readonly tabStop = computed(() =>
    menubarTabStop(this.openMenu(), this.lastTrigger(), this.menus().length),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly triggers = viewChildren<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly classes = computed(() => menubarClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly menuClasses = computed(() => menubarMenuClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly submenuClasses = computed(() => menubarSubmenuClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly shortcutClasses = computed(() => menubarShortcutClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly triggerSlotClasses = menubarTriggerSlotClasses;
  /** @internal */
  protected readonly itemSlotClasses = menubarItemSlotClasses;
  /** @internal */
  protected readonly separatorClasses = menubarSeparatorClasses;
  /** @internal */
  protected readonly itemIconClasses = menubarItemIconClasses;
  /** @internal */
  protected readonly itemLabelClasses = menubarItemLabelClasses;
  /** @internal */
  protected readonly submenuArrowClasses = menubarSubmenuArrowClasses;
  /** @internal */
  protected readonly submenuArrow = MENUBAR_SUBMENU_ARROW;
  /** @internal */
  protected readonly hasSubmenu = menubarHasSubmenu;
  /** @internal */
  protected readonly submenuLabel = menubarSubmenuLabel;

  constructor() {
    // The open menu takes focus as it appears, so screen readers follow its
    // aria-activedescendant.
    afterRenderEffect(() => this.panel()?.nativeElement.focus({ preventScroll: true }));
    injectClickOutside(
      () => this.host,
      () => {
        if (this.openMenu() !== null) this.closeAll();
      },
    );
  }

  /** @internal */
  protected triggerClasses(menu: number): string {
    return menubarTriggerClasses(this.effectiveSurface(), this.openMenu() === menu);
  }

  /** @internal */
  protected itemClasses(highlighted: boolean, disabled: boolean | undefined, submenu = false): string {
    return menubarItemClasses(this.effectiveSurface(), { highlighted, disabled: !!disabled, submenu });
  }

  /** @internal */
  protected activeDescendant(menu: number): string | null {
    const parent = this.openSubmenuItem();
    if (parent !== null && this.activeSubItem() >= 0) return this.ids.subitem(menu, parent, this.activeSubItem());
    return this.activeItem() >= 0 ? this.ids.item(menu, this.activeItem()) : null;
  }

  /** @internal */
  protected onTriggerClick(menu: number): void {
    if (this.openMenu() === menu) this.closeAll();
    else this.openMenuAt(menu);
  }

  /** @internal */
  protected onTriggerMouseenter(menu: number): void {
    const open = this.openMenu();
    if (open !== null && open !== menu) this.openMenuAt(menu);
  }

  /** @internal */
  protected onItemMouseenter(item: PixelMenubarItem, index: number): void {
    if (item.disabled) return;
    this.activeItem.set(index);
    this.activeSubItem.set(-1);
    this.openSubmenuItem.set(menubarHasSubmenu(item) ? index : null);
  }

  /** @internal */
  protected onSubItemMouseenter(sub: PixelMenubarItem, index: number): void {
    if (!sub.disabled) this.activeSubItem.set(index);
  }

  /** @internal */
  protected onSubItemClick(event: MouseEvent, sub: PixelMenubarItem): void {
    event.stopPropagation();
    this.activateSub(sub);
  }

  /** @internal */
  protected activate(item: PixelMenubarItem): void {
    if (item.disabled || item.separator || menubarHasSubmenu(item)) return;
    item.onSelect?.();
    this.closeToTrigger();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const open = this.openMenu();
    const items = open === null ? [] : (this.menus()[open]?.items ?? []);
    const highlighted = items[this.activeItem()];
    const parent = this.openSubmenuItem();
    const submenu = parent === null ? [] : (items[parent]?.submenu ?? []);
    const action = menubarKeyAction(event.key, {
      open: open !== null,
      onSubmenuParent: menubarHasSubmenu(highlighted),
      submenuOpen: parent !== null,
      inSubmenu: parent !== null && this.activeSubItem() >= 0,
    });
    if (!action) return;

    const triggers = this.triggers().map((trigger) => trigger.nativeElement);
    if (action.type === 'leave') {
      // Focus is back on the button before the browser's own Tab, which then
      // moves on from there.
      if (open !== null) triggers[open]?.focus();
      this.closeAll();
      return;
    }
    event.preventDefault();
    const focusedTrigger = triggers.indexOf(event.target as HTMLElement);
    switch (action.type) {
      case 'switch': {
        // While every menu is closed, the focused button is the current one.
        const count = this.menus().length;
        this.openMenuAt(((open ?? Math.max(0, focusedTrigger)) + action.step + count) % count);
        break;
      }
      case 'open':
        if (focusedTrigger >= 0) this.openMenuAt(focusedTrigger, action.move);
        break;
      case 'move':
        if (action.level === 'submenu') {
          this.activeSubItem.set(menubarHighlight(submenu, this.activeSubItem(), action.move));
        } else {
          this.activeItem.set(menubarHighlight(items, this.activeItem(), action.move));
          this.openSubmenuItem.set(null);
          this.activeSubItem.set(-1);
        }
        break;
      case 'enter':
        this.openSubmenuItem.set(this.activeItem());
        this.activeSubItem.set(menubarHighlight(highlighted?.submenu ?? [], -1, 'first'));
        break;
      case 'exit':
        this.openSubmenuItem.set(null);
        this.activeSubItem.set(-1);
        break;
      case 'select': {
        const sub = submenu[this.activeSubItem()];
        if (sub) this.activateSub(sub);
        else if (highlighted) this.activate(highlighted);
        break;
      }
      case 'close':
        this.closeToTrigger();
        break;
    }
  }

  private openMenuAt(menu: number, move: MenubarMove = 'first'): void {
    const items = this.menus()[menu]?.items;
    if (!items) return;
    this.openMenu.set(menu);
    this.lastTrigger.set(menu);
    this.activeItem.set(menubarHighlight(items, -1, move));
    this.openSubmenuItem.set(null);
    this.activeSubItem.set(-1);
  }

  private activateSub(sub: PixelMenubarItem): void {
    if (sub.disabled) return;
    sub.onSelect?.();
    this.closeToTrigger();
  }

  private closeAll(): void {
    this.openMenu.set(null);
    this.activeItem.set(-1);
    this.openSubmenuItem.set(null);
    this.activeSubItem.set(-1);
  }

  // Closing from inside the open menu (Escape, choosing an item) hands focus
  // back to its button; a press outside leaves focus to the pointer.
  private closeToTrigger(): void {
    const open = this.openMenu();
    if (open !== null && this.panel()?.nativeElement.contains(this.document.activeElement)) {
      this.triggers()[open]?.nativeElement.focus();
    }
    this.closeAll();
  }
}
