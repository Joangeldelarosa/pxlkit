<script setup lang="ts">
import { computed, useAttrs, warn, type VNode } from 'vue';
import {
  scrollAreaClasses,
  scrollAreaNameWarning,
  scrollAreaStyle,
  type ScrollAreaVariant,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Focusable scroll region (`role="region"`, `tabindex="0"`) with a styled
 * scrollbar: keyboard users can reach it and scroll it with the arrow and
 * page keys. Name it with `aria-label` or `aria-labelledby` — without either
 * (or a `tabindex` of your own) it warns in development. An own `role` or
 * `tabindex` replaces the default.
 */
export interface PixelScrollAreaProps {
  /** Height cap before the content scrolls: pixels, or any CSS length. */
  maxHeight?: string | number;
  /** When the scrollbar shows. */
  variant?: ScrollAreaVariant;
  /** @deprecated Use `variant`. */
  type?: ScrollAreaVariant;
  /** Keep the scrollbar's room reserved, so content never shifts. */
  offsetScrollbars?: boolean;
  /** Scrollbar thickness in pixels. */
  scrollbarSize?: number;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelScrollAreaProps>(), {
  maxHeight: undefined,
  variant: undefined,
  type: undefined,
  offsetScrollbars: false,
  scrollbarSize: undefined,
  surface: undefined,
  bordered: false,
});
defineSlots<{
  /** The content that scrolls. */
  default?(): VNode[];
}>();

const attrs = useAttrs();
const surface = useEffectiveSurface(() => props.surface);
const variant = computed<ScrollAreaVariant>(() => props.variant ?? props.type ?? 'auto');
const classes = computed(() => scrollAreaClasses(surface.value, { variant: variant.value, bordered: props.bordered }));
const style = computed(() =>
  scrollAreaStyle({
    maxHeight: props.maxHeight,
    scrollbarSize: props.scrollbarSize,
    offsetScrollbars: props.offsetScrollbars,
  }),
);

const warning = scrollAreaNameWarning({
  label: attrs['aria-label'],
  labelledBy: attrs['aria-labelledby'],
  tabIndex: attrs.tabindex ?? attrs.tabIndex,
});
if (warning) warn(warning);
</script>

<template>
  <div :data-scrollbar="variant" :data-surface="surface" role="region" tabindex="0" :class="classes" :style="style">
    <slot />
  </div>
</template>
