<script setup lang="ts">
import { computed, ref, useId, type VNode } from 'vue';
import { collapsibleClasses, collapsibleIds, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import PixelButton from '../actions/PixelButton.vue';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Disclosure: a compact ghost button with a chevron that shows and hides the
 * default slot. The button reports `aria-expanded` and controls the body
 * (`aria-controls`), which it labels; the body renders only while open.
 */
export interface PixelCollapsibleProps {
  /** Label of the header button. */
  label: string;
  /** Open on first render. */
  defaultOpen?: boolean;
  /** Tone of the header button. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Surface-aware border and radius around the collapsible. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelCollapsibleProps>(), {
  defaultOpen: false,
  tone: 'neutral',
  surface: undefined,
  bordered: false,
});
defineSlots<{
  /** The body, rendered while open. */
  default?(): VNode[];
}>();

const effectiveSurface = useEffectiveSurface(() => props.surface);
const open = ref(props.defaultOpen);
const ids = collapsibleIds(useId());
const classes = computed(() => collapsibleClasses(effectiveSurface.value, { bordered: props.bordered, open: open.value }));
</script>

<template>
  <div :class="classes.root">
    <PixelButton
      :id="ids.trigger"
      type="button"
      size="sm"
      :tone="tone"
      :surface="effectiveSurface"
      variant="ghost"
      :aria-expanded="open"
      :aria-controls="ids.content"
      :class="classes.trigger"
      @click="open = !open"
    >
      {{ label }}
      <template #icon-right><PixelGlyph name="chevronDown" :class="classes.chevron" /></template>
    </PixelButton>
    <div v-if="open" :id="ids.content" :aria-labelledby="ids.trigger" :class="classes.content"><slot /></div>
  </div>
</template>
