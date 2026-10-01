<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, type VNode } from 'vue';
import {
  cn,
  focusRing,
  sizeClass,
  surfaceClasses,
  toneMap,
  type Size,
  type Surface,
  type Tone,
  type Variant,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { Slot, singleElementChild } from '../_internal/Slot.js';

/**
 * Versatile button with tones, sizes, icon slots, loading state, variants
 * (`solid` | `soft` | `outline` | `ghost`), surface aesthetic and an
 * `asChild` mode that styles a single child element (e.g. a router link).
 * Every other attribute and listener falls through to the `<button>`.
 */
export interface PixelButtonProps {
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Visual size. */
  size?: Size;
  /** `solid` | `soft` | `outline` | `ghost`. */
  variant?: Variant;
  /** Surface aesthetic override; defaults to the nearest provider. */
  surface?: Surface;
  /** Swaps the left icon for a spinner and disables the button. */
  loading?: boolean;
  /** Stretch to fill the parent's inline axis (`w-full`). */
  fullWidth?: boolean;
  /**
   * Render the single element of the default slot as the root instead of a
   * `<button>`; it receives the button classes and every attribute and
   * listener. Useful for `<a>` / `<RouterLink>` wrappers.
   */
  asChild?: boolean;
  /** Native `disabled`. */
  disabled?: boolean;
}

const props = withDefaults(defineProps<PixelButtonProps>(), {
  tone: 'green',
  size: 'md',
  variant: 'solid',
  surface: undefined,
  loading: false,
  fullWidth: false,
  asChild: false,
  disabled: false,
});

defineSlots<{
  default?(): VNode[];
  /** Leading icon; replaced by a spinner while `loading`. */
  'icon-left'?(): VNode[];
  /** Trailing icon. */
  'icon-right'?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);

const classes = computed(() => {
  const s = surfaceClasses(surface.value);
  const t = toneMap[props.tone];
  const isGhost = props.variant === 'ghost';
  const isOutline = props.variant === 'outline';
  const isSoft = props.variant === 'soft';
  const enabled = !props.disabled;

  const variantClasses = isGhost
    ? cn('border border-transparent bg-transparent', t.hover)
    : isOutline
      ? cn(s.border, t.border, 'bg-transparent', t.hover, enabled && s.shadow, enabled && s.shadowHover)
      : isSoft
        ? cn(s.border, t.border, t.soft, t.hover, enabled && s.shadow, enabled && s.shadowHover)
        : cn(s.border, t.border, t.bg, t.hover, enabled && s.shadow, enabled && s.shadowHover);

  return cn(
    'inline-flex items-center justify-center font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    s.font,
    s.radius,
    s.transition,
    sizeClass[props.size],
    focusRing,
    t.ring,
    t.text,
    props.fullWidth && 'w-full',
    variantClasses,
    enabled && (isGhost || isOutline ? 'active:scale-[0.97]' : s.shadowActive),
  );
});

// Pin min-width to the width measured as loading starts, so the button does
// not collapse while the spinner replaces the leading icon.
const button = useTemplateRef<HTMLButtonElement>('button');
const minWidth = ref<number | null>(null);
watch(
  () => props.loading,
  (loading, wasLoading) => {
    if (!wasLoading && loading && button.value) {
      minWidth.value = button.value.getBoundingClientRect().width;
    }
    if (!loading) minWidth.value = null;
  },
  { flush: 'post' },
);
</script>

<template>
  <Slot v-if="asChild && singleElementChild($slots.default?.())" :class="classes">
    <slot />
  </Slot>
  <button
    v-else
    ref="button"
    :class="classes"
    :style="minWidth !== null ? { minWidth: `${minWidth}px` } : undefined"
    :disabled="loading || disabled"
  >
    <span
      v-if="loading"
      data-testid="pxl-button-spinner"
      aria-hidden="true"
      class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
    <slot v-else name="icon-left" />
    <span><slot /></span>
    <slot name="icon-right" />
  </button>
</template>
