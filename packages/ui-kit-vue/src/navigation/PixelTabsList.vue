<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { cn } from '@pxlkit/ui-kit-core';
import { useTabsContext } from './_internal/tabs-context.js';

/**
 * The tablist of a compositional `PixelTabs`. Classes go to the outer
 * wrapper; other attributes and listeners to the inner `role="tablist"`.
 */
const props = withDefaults(
  defineProps<{
    /** Accessible label of the tablist. */
    ariaLabel?: string;
    /** Scroll horizontally with a fade mask (ignored when vertical). */
    scrollable?: boolean;
  }>(),
  { ariaLabel: 'Tabs', scrollable: false },
);
defineSlots<{ default?(): VNode[] }>();
defineOptions({ inheritAttrs: false });

const context = useTabsContext('PixelTabsList');
const vertical = computed(() => context.orientation.value === 'vertical');
const scrolls = computed(() => props.scrollable && !vertical.value);
const fadeMask = 'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)';
</script>

<template>
  <div
    :class="
      cn(
        vertical
          ? 'flex flex-col gap-1 self-start border-r-2 border-retro-border/40 pr-px'
          : 'border-b-2 border-retro-border/40 pb-px',
        scrolls && 'relative',
        $attrs.class as string | undefined,
      )
    "
  >
    <!--
      A scrollable list keeps its tabs on one line, which overflows: `flex-wrap`
      would beat `flex-nowrap`, as Tailwind emits it last.
    -->
    <div
      v-bind="{ ...$attrs, class: undefined }"
      role="tablist"
      :aria-label="ariaLabel"
      :aria-orientation="context.orientation.value"
      :class="
        cn(
          'flex gap-1',
          vertical ? 'flex-col' : !scrolls && 'flex-wrap',
          scrolls && 'flex-nowrap overflow-x-auto scrollbar-hidden',
          scrolls && 'overflow-y-hidden',
        )
      "
      :data-scrollable="scrolls ? 'true' : undefined"
      :style="scrolls ? { WebkitMaskImage: fadeMask, maskImage: fadeMask, scrollbarWidth: 'none' } : undefined"
    >
      <slot />
    </div>
  </div>
</template>
