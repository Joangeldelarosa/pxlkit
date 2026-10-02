<script setup lang="ts">
import { computed, ref, useId, type ComponentPublicInstance } from 'vue';
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
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** One item of a `PixelNavigationMenu`. */
export interface PixelNavigationMenuItem {
  label: string;
  /** Link target: the item is an `<a>`; without one it is a `<button>`. */
  href?: string;
  /** Called when the item is clicked, or activated with Enter or Space (a link follows its `href` instead). */
  onSelect?: () => void;
  /** Panel content, which the item opens: text, a VNode or a render function. */
  content?: PxlNode;
  /** Icon before the label, hidden from assistive technology. */
  icon?: PxlNode;
  /** Accepted as in the React kit; the menu does not display it. */
  description?: string;
}

/**
 * Navigation landmark of links and buttons, in a row or a column, whose items
 * can open a panel of content: one shared panel below the list
 * (`viewport`), or a panel under each item. Pointing at or focusing an item
 * opens its panel and leaving the menu closes it; the arrow keys of the
 * orientation move focus round the items, Home and End jump to the ends,
 * Escape closes the panel and Enter or Space toggles it.
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
const active = ref<number | null>(null);
const triggers: HTMLElement[] = [];

const rows = computed(() =>
  props.items.map((item, index) => {
    const expanded = active.value === index && !!item.content;
    return { item, index, expanded, ids: navigationMenuIds(baseId, index), classes: navigationMenuTriggerClasses(surface.value, expanded) };
  }),
);
const viewportPanel = computed(() => {
  const index = active.value;
  const item = index === null ? undefined : props.items[index];
  return props.viewport && index !== null && item?.content ? { content: item.content, ids: navigationMenuIds(baseId, index) } : null;
});

function setTrigger(index: number, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) triggers[index] = element;
}

function toggle(index: number) {
  active.value = active.value === index ? null : index;
}

function onMouseenter(item: PixelNavigationMenuItem, index: number) {
  active.value = item.content ? index : null;
}

function onFocus(item: PixelNavigationMenuItem, index: number) {
  if (item.content) active.value = index;
}

function onClick(event: MouseEvent, item: PixelNavigationMenuItem, index: number) {
  item.onSelect?.();
  if (!item.content) return;
  // A link with a panel toggles it instead of navigating.
  if (item.href) event.preventDefault();
  toggle(index);
}

function onKeydown(event: KeyboardEvent, item: PixelNavigationMenuItem, index: number) {
  const action = navigationMenuKeyAction(event.key, props.orientation);
  if (action === undefined) return;
  if (action === 'activate') {
    // Links handle Enter natively: the browser follows them.
    if (item.href) return;
    event.preventDefault();
    if (item.content) toggle(index);
    item.onSelect?.();
    return;
  }
  event.preventDefault();
  if (action === 'close') active.value = null;
  else triggers[navigationMenuFocusIndex(index, action, props.items.length)]?.focus();
}

function onMouseleave(event: MouseEvent) {
  if (!event.defaultPrevented) active.value = null;
}
</script>

<template>
  <nav :aria-label="ariaLabel" :class="navigationMenuClasses(surface)" @mouseleave="onMouseleave">
    <ul role="menubar" :aria-orientation="orientation" :class="navigationMenuListClasses(orientation)">
      <li v-for="row in rows" :key="`${row.item.label}-${row.index}`" role="none" :class="navigationMenuItemClasses">
        <component
          :is="row.item.href ? 'a' : 'button'"
          :ref="(element: Element | ComponentPublicInstance | null) => setTrigger(row.index, element)"
          v-bind="row.item.href ? { href: row.item.href } : { type: 'button' }"
          :id="row.ids.trigger"
          role="menuitem"
          tabindex="0"
          :aria-haspopup="row.item.content ? 'menu' : undefined"
          :aria-expanded="row.item.content ? row.expanded : undefined"
          :aria-controls="row.expanded ? row.ids.panel : undefined"
          :class="row.classes"
          @mouseenter="onMouseenter(row.item, row.index)"
          @focus="onFocus(row.item, row.index)"
          @keydown="onKeydown($event, row.item, row.index)"
          @click="onClick($event, row.item, row.index)"
        >
          <span v-if="row.item.icon" aria-hidden="true" :class="navigationMenuIconClasses">
            <RenderNode :node="row.item.icon" />
          </span>
          <span :class="navigationMenuLabelClasses">{{ row.item.label }}</span>
        </component>
        <div
          v-if="!viewport && row.expanded"
          :id="row.ids.panel"
          role="menu"
          :aria-labelledby="row.ids.trigger"
          :class="navigationMenuPanelClasses(surface)"
        >
          <RenderNode :node="row.item.content" />
        </div>
      </li>
    </ul>
    <div
      v-if="viewportPanel"
      :id="viewportPanel.ids.panel"
      role="menu"
      :aria-labelledby="viewportPanel.ids.trigger"
      :class="navigationMenuViewportClasses(surface, orientation)"
    >
      <RenderNode :node="viewportPanel.content" />
    </div>
  </nav>
</template>
