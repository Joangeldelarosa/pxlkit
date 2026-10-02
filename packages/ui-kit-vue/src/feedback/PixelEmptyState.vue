<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { emptyStateClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Placeholder for an empty collection or a search without results: a dashed,
 * centred block with a title (`<h4>`), a description and an optional
 * decorative icon and call to action.
 *
 * @example
 * <PixelEmptyState title="No results found" description="Try other filters.">
 *   <template #action><PixelButton size="sm">Reset filters</PixelButton></template>
 * </PixelEmptyState>
 */
export interface PixelEmptyStateProps {
  /** Short title (e.g. `"No results"`). */
  title: string;
  /** Supporting description below the title. */
  description: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelEmptyStateProps>(), { surface: undefined });
defineSlots<{
  /** Decorative icon above the title (hidden from assistive tech). */
  icon?(): VNode[];
  /** Call to action under the description (a button, a link). */
  action?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => emptyStateClasses(surface.value));
</script>

<template>
  <div :class="classes.root">
    <div v-if="$slots.icon" :class="classes.icon" aria-hidden="true"><slot name="icon" /></div>
    <h4 :class="classes.title">{{ title }}</h4>
    <p :class="classes.description">{{ description }}</p>
    <div v-if="$slots.action" :class="classes.action"><slot name="action" /></div>
  </div>
</template>
