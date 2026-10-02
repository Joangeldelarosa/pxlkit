<script setup lang="ts">
import { computed, warn, type VNode } from 'vue';
import {
  INPUT_GROUP_UNNAMED_WARNING,
  inputGroupClasses,
  inputGroupItemClasses,
  inputGroupRole,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { slotNodes } from '../_internal/Slot.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Joins the form controls of its default slot (inputs, buttons, selects) into
 * one shell: each loses its own border and corners and gains a divider. Name
 * the group with `aria-label` or `aria-labelledby` — it is a `group` only
 * then. Extra attributes go to the shell `<div>`.
 */
export interface PixelInputGroupProps {
  /** Height of the shell. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Role of the shell; `group` when named and left out. */
  role?: string;
  /** Accessible name of the group — strongly recommended. */
  ariaLabel?: string;
  /** Id of the element that names the group. */
  ariaLabelledby?: string;
}

const props = withDefaults(defineProps<PixelInputGroupProps>(), {
  size: 'md',
  surface: undefined,
  role: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
});
const slots = defineSlots<{
  /** The controls to join; each element is joined, text is dropped. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const named = computed(() => !!(props.ariaLabel || props.ariaLabelledby));

// Read while rendering, like the React kit's cloneElement: each element of
// the slot is rendered with the join classes merged into its own.
function controls() {
  const nodes = slotNodes(slots.default?.());
  if (nodes.length > 1 && !named.value) warn(INPUT_GROUP_UNNAMED_WARNING);
  const elements = nodes.filter((node) => typeof node.type !== 'symbol');
  return elements.map((node, index) => ({
    node,
    class: inputGroupItemClasses(surface.value, index === elements.length - 1),
  }));
}
</script>

<template>
  <div
    :role="inputGroupRole(role, named)"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :class="inputGroupClasses(surface, size)"
  >
    <component :is="control.node" v-for="(control, index) in controls()" :key="index" :class="control.class" />
  </div>
</template>
