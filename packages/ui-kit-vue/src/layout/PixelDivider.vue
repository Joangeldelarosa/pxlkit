<script setup lang="ts">
import { computed } from 'vue';
import { dividerClasses, type DividerSpacing, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Horizontal rule, or two rules around a label (`role="separator"` named by
 * the label). The pixel surface draws dotted rules and diamond ornaments.
 */
export interface PixelDividerProps {
  /** Label centred between two rules; a plain `<hr>` without one. */
  label?: string;
  /** Tone of the label text. */
  tone?: Tone;
  /** Symmetric vertical padding. */
  spacing?: DividerSpacing;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelDividerProps>(), {
  label: undefined,
  tone: 'neutral',
  spacing: 'none',
  surface: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => dividerClasses(surface.value, props.spacing, props.tone));
</script>

<template>
  <hr v-if="!label" :class="classes.rule" />
  <div v-else role="separator" aria-orientation="horizontal" :aria-label="label" :class="classes.separator">
    <hr aria-hidden="true" :class="classes.line" />
    <span :class="classes.label">
      <span v-if="surface === 'pixel'" aria-hidden="true" class="opacity-60">◆</span>
      {{ label }}
      <span v-if="surface === 'pixel'" aria-hidden="true" class="opacity-60">◆</span>
    </span>
    <hr aria-hidden="true" :class="classes.line" />
  </div>
</template>
