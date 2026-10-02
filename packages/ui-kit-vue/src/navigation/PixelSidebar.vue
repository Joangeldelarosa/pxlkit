<script setup lang="ts">
import type { VNode } from 'vue';
import {
  sidebarBodyClasses,
  sidebarClasses,
  sidebarFooterClasses,
  sidebarHeaderClasses,
  sidebarHeaderContentClasses,
  sidebarListClasses,
  sidebarSectionClasses,
  sidebarSectionLabel,
  sidebarSectionTitleClasses,
  sidebarToggleArrow,
  sidebarToggleArrowClasses,
  sidebarToggleClasses,
  sidebarToggleLabel,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import type { PxlNode } from '../_internal/render-node.js';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import SidebarItem from './_internal/SidebarItem.vue';

/** One item of a `PixelSidebar` section. */
export interface PixelSidebarItemProps {
  id: string;
  label: string;
  /** Icon before the label, hidden from assistive technology: text, a VNode or a render function. */
  icon?: PxlNode;
  /** Badge at the end of the row (hidden while collapsed). */
  badge?: { label: string; tone?: ToneKey };
  /** Link target: the item is an `<a>`; without one it is a `<button>`. */
  href?: string;
  /** Called when the item's button is clicked (not for links). */
  onSelect?: () => void;
  /** The current page: tinted and marked `aria-current="page"`. */
  active?: boolean;
  /** Items nested under this one (hidden while collapsed). */
  nested?: PixelSidebarItemProps[];
}

/** A titled group of sidebar items. */
export interface PixelSidebarSectionProps {
  /** Heading of the section (hidden while collapsed). */
  label?: string;
  /** @deprecated Use `label`. */
  title?: string;
  items: PixelSidebarItemProps[];
}

/**
 * Vertical navigation rail in a `<nav>` landmark named "Sidebar" (an
 * `aria-label` attribute renames it): sections of items with badges and
 * nested items, under an optional `#header` and above an optional `#footer`.
 * With `collapsible`, a toggle (`aria-expanded`) narrows the rail to its
 * icons; bind the state with `v-model:collapsed`, or leave it uncontrolled
 * with `default-collapsed`. Other attributes fall through to the `<nav>`.
 *
 * @example
 * <PixelSidebar v-model:collapsed="collapsed" collapsible :sections="sections">
 *   <template #header>pxlkit</template>
 * </PixelSidebar>
 */
export interface PixelSidebarProps {
  /** Shows the collapse toggle in the header row. */
  collapsible?: boolean;
  /** Initial collapsed state while uncontrolled. */
  defaultCollapsed?: boolean;
  /** Collapsed state (`v-model:collapsed`); leave unset for an uncontrolled rail. */
  collapsed?: boolean;
  /** The sections, in order. */
  sections: PixelSidebarSectionProps[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelSidebarProps>(), {
  collapsible: false,
  defaultCollapsed: false,
  collapsed: undefined,
  surface: undefined,
});
const emit = defineEmits<{
  /** The collapsed state the toggle asks for, for `v-model:collapsed`. */
  'update:collapsed': [collapsed: boolean];
}>();
defineSlots<{
  /** Header content beside the toggle (hidden while collapsed). */
  header?(): VNode[];
  /** Footer row content. */
  footer?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [collapsed, setCollapsed] = useControllableState({
  value: () => props.collapsed,
  defaultValue: () => props.defaultCollapsed,
  onChange: (next) => emit('update:collapsed', next),
});
</script>

<template>
  <nav aria-label="Sidebar" :class="sidebarClasses(surface, collapsed)">
    <div v-if="$slots.header || collapsible" :class="sidebarHeaderClasses(collapsed)">
      <div v-if="!collapsed && $slots.header" :class="sidebarHeaderContentClasses"><slot name="header" /></div>
      <button
        v-if="collapsible"
        type="button"
        :aria-expanded="!collapsed"
        :aria-label="sidebarToggleLabel(collapsed)"
        :class="sidebarToggleClasses(surface)"
        @click="setCollapsed(!collapsed)"
      >
        <span aria-hidden="true" :class="sidebarToggleArrowClasses">{{ sidebarToggleArrow(collapsed) }}</span>
      </button>
    </div>

    <div :class="sidebarBodyClasses">
      <div
        v-for="(section, index) in sections"
        :key="sidebarSectionLabel(section) ?? `section-${index}`"
        :class="sidebarSectionClasses(index)"
      >
        <h3 v-if="sidebarSectionLabel(section) && !collapsed" :class="sidebarSectionTitleClasses(surface)">
          {{ sidebarSectionLabel(section) }}
        </h3>
        <ul role="list" :class="sidebarListClasses">
          <SidebarItem
            v-for="item in section.items"
            :key="item.id"
            :item="item"
            :surface="surface"
            :collapsed="collapsed"
            :depth="0"
          />
        </ul>
      </div>
    </div>

    <div v-if="$slots.footer" :class="sidebarFooterClasses(collapsed)"><slot name="footer" /></div>
  </nav>
</template>
