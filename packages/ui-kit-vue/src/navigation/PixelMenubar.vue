<script setup lang="ts">
import { ref, useId, useTemplateRef, type ComponentPublicInstance } from 'vue';
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
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useClickOutside } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** An item of a `PixelMenubar` menu. */
export interface PixelMenubarItem {
  /** Identity of the item. */
  value: string;
  label: string;
  /** Icon before the label: text, a VNode or a render function. */
  icon?: PxlNode;
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

/** A top-level menu of a `PixelMenubar`. */
export interface PixelMenubarMenu {
  /** Label of the menu button. */
  label: string;
  items: PixelMenubarItem[];
}

/**
 * Application menubar (`role="menubar"`) of menu buttons, each opening a menu
 * of actions with icons, shortcut hints, separators, disabled items and
 * submenus. The open menu takes focus and points `aria-activedescendant` at
 * the highlighted item: Up and Down move round the enabled items (on a closed
 * button they open its menu on the first or last one), Home and End jump to
 * the ends, Right enters a submenu and Left leaves it, Left and Right switch
 * menus, Enter and Space choose. Escape closes the submenu, then the menu,
 * with focus back on its button; choosing an item and Tab close it too.
 * Pointing at another button while a menu is open switches to its menu; a
 * press outside closes it. Attributes and listeners go to the menubar.
 *
 * @example
 * <PixelMenubar :menus="[{ label: 'File', items: [{ value: 'new', label: 'New', shortcut: 'Ctrl+N' }] }]" />
 */
export interface PixelMenubarProps {
  /** The menus, in order. */
  menus: PixelMenubarMenu[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelMenubarProps>(), { surface: undefined });

const surface = useEffectiveSurface(() => props.surface);
const ids = menubarIds(useId());
const root = useTemplateRef<HTMLElement>('root');
const openMenu = ref<number | null>(null);
const activeItem = ref(-1);
const openSubmenuItem = ref<number | null>(null);
const activeSubItem = ref(-1);
// The button that last had focus or a menu open keeps the tab stop.
const lastTrigger = ref(0);
const triggers: HTMLElement[] = [];
const menuElements: Array<HTMLElement | null> = [];

function setTrigger(index: number, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) triggers[index] = element;
}

// The open menu takes focus as it appears, so screen readers follow its
// aria-activedescendant. Function refs run on every update: only a new
// element takes focus.
function setMenu(index: number, element: Element | ComponentPublicInstance | null) {
  const next = element instanceof HTMLElement ? element : null;
  if (next && next !== menuElements[index]) next.focus({ preventScroll: true });
  menuElements[index] = next;
}

function closeAll() {
  openMenu.value = null;
  activeItem.value = -1;
  openSubmenuItem.value = null;
  activeSubItem.value = -1;
}

// Closing from inside the open menu (Escape, choosing an item) hands focus
// back to its button; a press outside leaves focus to the pointer.
function closeToTrigger() {
  const open = openMenu.value;
  if (open !== null && menuElements[open]?.contains(document.activeElement)) triggers[open]?.focus();
  closeAll();
}

function openMenuAt(index: number, move: MenubarMove = 'first') {
  const menu = props.menus[index];
  if (!menu) return;
  openMenu.value = index;
  lastTrigger.value = index;
  activeItem.value = menubarHighlight(menu.items, -1, move);
  openSubmenuItem.value = null;
  activeSubItem.value = -1;
}

useClickOutside(root, () => {
  if (openMenu.value !== null) closeAll();
});

function onTriggerClick(index: number) {
  if (openMenu.value === index) closeAll();
  else openMenuAt(index);
}

function onTriggerMouseenter(index: number) {
  if (openMenu.value !== null && openMenu.value !== index) openMenuAt(index);
}

function onItemMouseenter(item: PixelMenubarItem, index: number) {
  if (item.disabled) return;
  activeItem.value = index;
  activeSubItem.value = -1;
  openSubmenuItem.value = menubarHasSubmenu(item) ? index : null;
}

function activate(item: PixelMenubarItem) {
  if (item.disabled || item.separator || menubarHasSubmenu(item)) return;
  item.onSelect?.();
  closeToTrigger();
}

function activateSub(sub: PixelMenubarItem) {
  if (sub.disabled) return;
  sub.onSelect?.();
  closeToTrigger();
}

function activeDescendant(menu: number): string | undefined {
  if (openSubmenuItem.value !== null && activeSubItem.value >= 0) {
    return ids.subitem(menu, openSubmenuItem.value, activeSubItem.value);
  }
  return activeItem.value >= 0 ? ids.item(menu, activeItem.value) : undefined;
}

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const open = openMenu.value;
  const items = open === null ? [] : (props.menus[open]?.items ?? []);
  const highlighted = items[activeItem.value];
  const submenu = openSubmenuItem.value === null ? [] : (items[openSubmenuItem.value]?.submenu ?? []);
  const action = menubarKeyAction(event.key, {
    open: open !== null,
    onSubmenuParent: menubarHasSubmenu(highlighted),
    submenuOpen: openSubmenuItem.value !== null,
    inSubmenu: openSubmenuItem.value !== null && activeSubItem.value >= 0,
  });
  if (!action) return;

  if (action.type === 'leave') {
    // Focus is back on the button before the browser's own Tab, which then
    // moves on from there.
    if (open !== null) triggers[open]?.focus();
    closeAll();
    return;
  }
  event.preventDefault();
  const focusedTrigger = triggers.indexOf(event.target as HTMLElement);
  switch (action.type) {
    case 'switch': {
      // While every menu is closed, the focused button is the current one.
      const current = open ?? Math.max(0, focusedTrigger);
      openMenuAt((current + action.step + props.menus.length) % props.menus.length);
      break;
    }
    case 'open':
      if (focusedTrigger >= 0) openMenuAt(focusedTrigger, action.move);
      break;
    case 'move':
      if (action.level === 'submenu') {
        activeSubItem.value = menubarHighlight(submenu, activeSubItem.value, action.move);
      } else {
        activeItem.value = menubarHighlight(items, activeItem.value, action.move);
        openSubmenuItem.value = null;
        activeSubItem.value = -1;
      }
      break;
    case 'enter':
      openSubmenuItem.value = activeItem.value;
      activeSubItem.value = menubarHighlight(highlighted?.submenu ?? [], -1, 'first');
      break;
    case 'exit':
      openSubmenuItem.value = null;
      activeSubItem.value = -1;
      break;
    case 'select':
      if (activeSubItem.value >= 0) {
        const sub = submenu[activeSubItem.value];
        if (sub) activateSub(sub);
      } else if (highlighted) {
        activate(highlighted);
      }
      break;
    case 'close':
      closeToTrigger();
      break;
  }
}
</script>

<template>
  <div ref="root" role="menubar" aria-orientation="horizontal" :class="menubarClasses(surface)" @keydown="onKeydown">
    <div v-for="(menu, mIdx) in menus" :key="`${menu.label}-${mIdx}`" :class="menubarTriggerSlotClasses">
      <button
        :ref="(element: Element | ComponentPublicInstance | null) => setTrigger(mIdx, element)"
        :id="ids.trigger(mIdx)"
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        :aria-expanded="openMenu === mIdx"
        :aria-controls="openMenu === mIdx ? ids.menu(mIdx) : undefined"
        :tabindex="mIdx === menubarTabStop(openMenu, lastTrigger, menus.length) ? 0 : -1"
        :class="menubarTriggerClasses(surface, openMenu === mIdx)"
        @focus="lastTrigger = mIdx"
        @click="onTriggerClick(mIdx)"
        @mouseenter="onTriggerMouseenter(mIdx)"
      >
        {{ menu.label }}
      </button>

      <div
        v-if="openMenu === mIdx"
        :ref="(element: Element | ComponentPublicInstance | null) => setMenu(mIdx, element)"
        :id="ids.menu(mIdx)"
        role="menu"
        tabindex="-1"
        :aria-labelledby="ids.trigger(mIdx)"
        :aria-activedescendant="activeDescendant(mIdx)"
        :class="menubarMenuClasses(surface)"
      >
        <template v-for="(item, iIdx) in menu.items" :key="item.separator ? `sep-${iIdx}` : item.value">
          <div v-if="item.separator" role="separator" :class="menubarSeparatorClasses" />
          <div v-else :class="menubarItemSlotClasses" @mouseenter="onItemMouseenter(item, iIdx)">
            <div
              :id="ids.item(mIdx, iIdx)"
              role="menuitem"
              :aria-disabled="item.disabled || undefined"
              :aria-haspopup="menubarHasSubmenu(item) ? 'menu' : undefined"
              :aria-expanded="menubarHasSubmenu(item) ? openSubmenuItem === iIdx : undefined"
              tabindex="-1"
              :class="menubarItemClasses(surface, { highlighted: activeItem === iIdx, disabled: !!item.disabled })"
              @click="activate(item)"
            >
              <span v-if="item.icon" :class="menubarItemIconClasses"><RenderNode :node="item.icon" /></span>
              <span :class="menubarItemLabelClasses">{{ item.label }}</span>
              <kbd v-if="item.shortcut" :class="menubarShortcutClasses(surface)">{{ item.shortcut }}</kbd>
              <span v-if="menubarHasSubmenu(item)" aria-hidden="true" :class="menubarSubmenuArrowClasses">
                {{ MENUBAR_SUBMENU_ARROW }}
              </span>
            </div>

            <div
              v-if="menubarHasSubmenu(item) && openSubmenuItem === iIdx"
              role="menu"
              :aria-label="menubarSubmenuLabel(item.label)"
              :class="menubarSubmenuClasses(surface)"
            >
              <template v-for="(sub, sIdx) in item.submenu" :key="sub.separator ? `sub-sep-${sIdx}` : sub.value">
                <div v-if="sub.separator" role="separator" :class="menubarSeparatorClasses" />
                <div
                  v-else
                  :id="ids.subitem(mIdx, iIdx, sIdx)"
                  role="menuitem"
                  :aria-disabled="sub.disabled || undefined"
                  tabindex="-1"
                  :class="
                    menubarItemClasses(surface, { highlighted: activeSubItem === sIdx, disabled: !!sub.disabled, submenu: true })
                  "
                  @mouseenter="!sub.disabled && (activeSubItem = sIdx)"
                  @click.stop="activateSub(sub)"
                >
                  <span v-if="sub.icon" :class="menubarItemIconClasses"><RenderNode :node="sub.icon" /></span>
                  <span :class="menubarItemLabelClasses">{{ sub.label }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
