<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  badgeSizeClasses,
  badgeVariantClasses,
  cn,
  surfaceClasses,
  toneMap,
  type PixelBadgeVariant,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Compact status label with tone, variant, size and an optional leading
 * icon. With a `click` listener it renders a `<button type="button">` (focus
 * ring, hover) instead of a `<span>`, for native keyboard semantics.
 */
export interface PixelBadgeProps {
  /** Tone tint. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Variant axis: soft (default), solid, outline, ghost. */
  variant?: PixelBadgeVariant;
  /** Size scale. */
  size?: Size;
  /**
   * Click handler (`@click`). Declared as a prop because its presence changes
   * the element: with one the badge is a `<button type="button">`.
   */
  onClick?: (event: MouseEvent) => void;
}

const props = withDefaults(defineProps<PixelBadgeProps>(), {
  tone: 'green',
  surface: undefined,
  variant: 'soft',
  size: 'md',
});
defineSlots<{
  /** Badge content. */
  default?(): VNode[];
  /** Leading icon. */
  'icon-left'?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const interactive = computed(() => props.onClick !== undefined);

const classes = computed(() => {
  const s = surfaceClasses(surface.value);
  return cn(
    'inline-flex items-center leading-none',
    s.border,
    s.radiusFull,
    s.font,
    badgeSizeClasses[props.size],
    badgeVariantClasses(props.variant, props.tone),
    interactive.value &&
      cn(
        'cursor-pointer transition-colors',
        toneMap[props.tone].hover,
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
        toneMap[props.tone].ring,
      ),
  );
});
</script>

<template>
  <button v-if="interactive" type="button" :class="classes" @click="onClick">
    <span v-if="$slots['icon-left']" class="inline-flex items-center shrink-0"><slot name="icon-left" /></span>
    <slot />
  </button>
  <span v-else :class="classes">
    <span v-if="$slots['icon-left']" class="inline-flex items-center shrink-0"><slot name="icon-left" /></span>
    <slot />
  </span>
</template>
