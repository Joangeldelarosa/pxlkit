<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { iconButtonClasses, iconButtonIconClasses, type Size, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Square, icon-only button, named by its required `label`: it is set as
 * both `aria-label` and `title`. The icon goes in the `icon` slot; every
 * other attribute and listener falls through to the `<button>`.
 */
export interface PixelIconButtonProps {
  /** Accessible name, set as `aria-label` and `title`. */
  label: string;
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Visual size; the button is a square of it (`sizeSquare`). */
  size?: Size;
  /** Surface aesthetic override; defaults to the nearest provider. */
  surface?: Surface;
  /** Native `disabled`; a disabled button also drops its shadows. */
  disabled?: boolean;
}

const props = withDefaults(defineProps<PixelIconButtonProps>(), {
  tone: 'cyan',
  size: 'md',
  surface: undefined,
  disabled: false,
});
defineSlots<{
  /** The icon. */
  icon?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  iconButtonClasses(surface.value, { tone: props.tone, size: props.size, disabled: props.disabled }),
);
</script>

<template>
  <button :aria-label="label" :title="label" :class="classes" :disabled="disabled">
    <span :class="iconButtonIconClasses"><slot name="icon" /></span>
  </button>
</template>
