<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { cn, focusRing, surfaceClasses } from '@pxlkit/ui-kit-core';
import { useTabsContext } from './_internal/tabs-context.js';

/**
 * The panel (`role="tabpanel"`) of one tab. Only the active panel is in the
 * DOM unless `keep-mounted` is set here or on the root.
 */
const props = withDefaults(
  defineProps<{
    /** Id of the tab — matches a `PixelTabsTrigger` value. */
    value: string;
    /** Override the root's `keep-mounted` for this panel. */
    keepMounted?: boolean;
    /** Surface-aware border and radius chrome. */
    bordered?: boolean;
  }>(),
  { keepMounted: undefined, bordered: false },
);
defineSlots<{ default?(): VNode[] }>();

const context = useTabsContext('PixelTabsPanel');
const selected = computed(() => context.active.value === props.value);
const mounted = computed(() => (props.keepMounted ?? context.keepMounted.value) || selected.value);
const classes = computed(() => {
  const s = surfaceClasses(context.surface.value);
  return cn(
    'p-3 text-sm text-retro-muted outline-none',
    props.bordered && 'bg-retro-bg/50',
    props.bordered && s.border,
    props.bordered && s.radius,
    props.bordered && 'border-retro-border/40',
    focusRing,
    'focus-visible:ring-retro-cyan/30',
  );
});
</script>

<template>
  <div
    v-if="mounted"
    role="tabpanel"
    :id="`${context.baseId}-panel-${value}`"
    :aria-labelledby="`${context.baseId}-tab-${value}`"
    :hidden="!selected"
    :data-state="selected ? 'active' : 'inactive'"
    tabindex="0"
    :class="classes"
  >
    <slot />
  </div>
</template>
