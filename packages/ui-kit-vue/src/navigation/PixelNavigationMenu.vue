<script setup lang="ts">
import { computed, shallowRef, useId, type ComponentPublicInstance } from 'vue';
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
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** One item of a `PixelNavigationMenu`. */
export interface PixelNavigationMenuItem {
  label: string;
  /** Link target of an item without `content`, which is then an `<a>`; any other item is a `<button>`. */
  href?: string;
  /** Called when the item is clicked, or activated with Enter or Space. */
  onSelect?: () => void;
  /**
   * Panel content: text, a VNode or a render function. The item is a button
   * that shows and hides it, and never follows an `href`.
   */
  content?: PxlNode;
  /** Icon before the label, hidden from assistive technology. */
  icon?: PxlNode;
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
 * back on its button.
 *
 * @example
 * <PixelNavigationMenu :items="[{ label: 'Home', href: '/' }, { label: 'Products', content: () => h(ProductLinks) }]" />
 */
export interface PixelNavigationMenuProps {
  /** The items, in order. */
  items: PixelNavigationMenuItem[];
  /** Items in a row or a column; also the arrow keys that move between them. */
  orientation?: NavigationMenuOrientation;
  /** One shared panel below the list, instead of a panel under each item. */
  viewport?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name of the landmark — give each navigation landmark of a page its own. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelNavigationMenuProps>(), {
  orientation: 'horizontal',
  viewport: true,
  surface: undefined,
  ariaLabel: 'Main navigation',
});

const surface = useEffectiveSurface(() => props.surface);
const baseId = useId();
const open = shallowRef<NavigationMenuOpen | null>(null);
const triggers: HTMLElement[] = [];

const rows = computed(() =>
  props.items.map((item, index) => {
    const expanded = !!item.content && open.value?.index === index;
    return {
      item,
      index,
      expanded,
      link: !item.content && !!item.href,
      panelId: navigationMenuPanelId(baseId, index),
      classes: navigationMenuTriggerClasses(surface.value, expanded),
    };
  }),
);

function setTrigger(index: number, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) triggers[index] = element;
}

// A panel closing while focus is inside it hands focus to its button.
function setOpen(next: NavigationMenuOpen | null) {
  const current = open.value;
  if (current && current.index !== next?.index) returnNavigationMenuFocus(triggers[current.index]);
  open.value = next;
}

// Only a mouse opens a panel by pointing: a tap fires the pointer, mouse and
// focus events of a hover before its click.
function onPointerenter(event: PointerEvent, item: PixelNavigationMenuItem, index: number) {
  setOpen(navigationMenuPointerEnter(open.value, index, !!item.content, event.pointerType));
}

function onClick(item: PixelNavigationMenuItem, index: number) {
  if (item.content) setOpen(navigationMenuClick(open.value, index));
  item.onSelect?.();
}

function close(event: KeyboardEvent) {
  if (!open.value) return;
  event.preventDefault();
  setOpen(null);
}

function onKeydown(event: KeyboardEvent, index: number) {
  const action = navigationMenuKeyAction(event.key, props.orientation);
  if (action === undefined) return;
  if (action === 'close') {
    close(event);
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
  triggers[navigationMenuFocusIndex(index, action, props.items.length)]?.focus();
}

function onPanelKeydown(event: KeyboardEvent) {
  if (navigationMenuKeyAction(event.key, props.orientation) === 'close') close(event);
}

function onMouseleave(event: MouseEvent) {
  if (!event.defaultPrevented) setOpen(navigationMenuPointerLeave(open.value));
}
</script>

<template>
  <nav :aria-label="ariaLabel" :class="navigationMenuClasses(surface)" @mouseleave="onMouseleave">
    <ul :class="navigationMenuListClasses(orientation)">
      <li v-for="row in rows" :key="`${row.item.label}-${row.index}`" :class="navigationMenuItemClasses(viewport)">
        <component
          :is="row.link ? 'a' : 'button'"
          :ref="(element: Element | ComponentPublicInstance | null) => setTrigger(row.index, element)"
          v-bind="row.link ? { href: row.item.href } : { type: 'button' }"
          :aria-expanded="row.item.content ? row.expanded : undefined"
          :aria-controls="row.item.content ? row.panelId : undefined"
          :class="row.classes"
          @pointerenter="onPointerenter($event, row.item, row.index)"
          @keydown="onKeydown($event, row.index)"
          @click="onClick(row.item, row.index)"
        >
          <span v-if="row.item.icon" aria-hidden="true" :class="navigationMenuIconClasses">
            <RenderNode :node="row.item.icon" />
          </span>
          <span :class="navigationMenuLabelClasses">{{ row.item.label }}</span>
        </component>
        <!-- The panel follows its button, so Tab moves into it; the shared viewport is drawn below the whole list all the same. -->
        <div
          v-if="row.expanded"
          :id="row.panelId"
          :class="viewport ? navigationMenuViewportClasses(surface, orientation) : navigationMenuPanelClasses(surface)"
          @keydown="onPanelKeydown"
        >
          <RenderNode :node="row.item.content" />
        </div>
      </li>
    </ul>
  </nav>
</template>
