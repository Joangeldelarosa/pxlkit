<script setup lang="ts">
import { computed } from 'vue';
import {
  sidebarBadgeClasses,
  sidebarItemClasses,
  sidebarItemIconClasses,
  sidebarItemLabelClasses,
  sidebarNestedListClasses,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { RenderNode } from '../../_internal/render-node.js';
import type { PixelSidebarItemProps } from '../PixelSidebar.vue';

/**
 * One item of a `PixelSidebar` in its `<li>`: a link with an `href`, a button
 * otherwise, and the items nested under it. Collapsed, the label is visually
 * hidden and names the item through `aria-label` and `title`.
 */
const props = defineProps<{
  item: PixelSidebarItemProps;
  surface: Surface;
  collapsed: boolean;
  /** 0 for the items of a section. */
  depth: number;
}>();

const classes = computed(() =>
  sidebarItemClasses(props.surface, { depth: props.depth, active: !!props.item.active, collapsed: props.collapsed }),
);
const name = computed(() => (props.collapsed ? props.item.label : undefined));
</script>

<template>
  <li>
    <component
      :is="item.href ? 'a' : 'button'"
      v-bind="item.href ? { href: item.href } : { type: 'button' }"
      :aria-current="item.active ? 'page' : undefined"
      :aria-label="name"
      :title="name"
      :class="classes"
      @click="!item.href && item.onSelect?.()"
    >
      <span v-if="item.icon" aria-hidden="true" :class="sidebarItemIconClasses"><RenderNode :node="item.icon" /></span>
      <span :class="sidebarItemLabelClasses(collapsed)">{{ item.label }}</span>
      <span v-if="item.badge && !collapsed" :class="sidebarBadgeClasses(surface, item.badge.tone)">{{ item.badge.label }}</span>
    </component>
    <ul v-if="item.nested?.length && !collapsed" :class="sidebarNestedListClasses">
      <SidebarItem
        v-for="child in item.nested"
        :key="child.id"
        :item="child"
        :surface="surface"
        :collapsed="collapsed"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>
