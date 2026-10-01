<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, type VNode } from 'vue';
import { cn, focusRing, surfaceClasses } from '@pxlkit/ui-kit-core';
import { useTabsContext } from './_internal/tabs-context.js';

/** One tab (`role="tab"`) of a compositional `PixelTabs`. */
const props = defineProps<{
  /** Id of the tab — matches a `PixelTabsPanel` value. */
  value: string;
}>();
defineSlots<{
  default?(): VNode[];
  /** Leading icon. */
  icon?(): VNode[];
}>();

const context = useTabsContext('PixelTabsTrigger');
const button = useTemplateRef<HTMLButtonElement>('button');
const selected = computed(() => context.active.value === props.value);

onMounted(() => context.registerTrigger(props.value, button.value!));
onBeforeUnmount(() => context.unregisterTrigger(props.value));

const classes = computed(() => {
  const s = surfaceClasses(context.surface.value);
  const vertical = context.orientation.value === 'vertical';
  const radius =
    context.surface.value === 'pixel'
      ? vertical
        ? 'rounded-l-[3px]'
        : 'rounded-t-[3px]'
      : vertical
        ? 'rounded-l-md'
        : 'rounded-t-md';
  return cn(
    'flex items-center gap-1.5 px-3 py-2 text-xs outline-none transition-colors',
    vertical ? '-mr-px' : '-mb-px',
    s.font,
    radius,
    s.border,
    vertical ? 'border-r-0' : 'border-b-0',
    focusRing,
    selected.value
      ? 'border-retro-border/40 bg-retro-bg text-retro-green'
      : 'border-transparent text-retro-muted hover:text-retro-text',
  );
});

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const vertical = context.orientation.value === 'vertical';
  switch (event.key) {
    case vertical ? 'ArrowDown' : 'ArrowRight':
      event.preventDefault();
      context.focusByOffset(props.value, 1);
      break;
    case vertical ? 'ArrowUp' : 'ArrowLeft':
      event.preventDefault();
      context.focusByOffset(props.value, -1);
      break;
    case 'Home':
      event.preventDefault();
      context.focusEdge('first');
      break;
    case 'End':
      event.preventDefault();
      context.focusEdge('last');
      break;
    case 'Enter':
    case ' ':
      if (context.activationMode.value === 'manual') {
        event.preventDefault();
        context.select(props.value);
      }
      break;
  }
}

function onFocus() {
  if (context.activationMode.value === 'automatic') context.select(props.value);
}
</script>

<template>
  <button
    ref="button"
    type="button"
    role="tab"
    :id="`${context.baseId}-tab-${value}`"
    :aria-selected="selected"
    :aria-controls="`${context.baseId}-panel-${value}`"
    :tabindex="selected ? 0 : -1"
    :data-state="selected ? 'active' : 'inactive'"
    :class="classes"
    @keydown="onKeydown"
    @focus="onFocus"
    @click="context.select(value)"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>
