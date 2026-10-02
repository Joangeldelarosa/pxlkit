<script setup lang="ts">
import { cloneVNode, computed, type VNode } from 'vue';
import {
  equalHeightGridClasses,
  equalHeightGridItemClasses,
  type EqualHeightGridRowAlign,
} from '@pxlkit/ui-kit-core';
import { slotNodes } from '../_internal/Slot.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelGrid, { type PixelGridProps } from './PixelGrid.vue';

/**
 * A `PixelGrid` whose items share their row's height: each element of the
 * default slot is laid out as an auto header, a stretching body and an auto
 * footer (`grid-rows-[auto_1fr_auto]`), so footers line up across a row. A
 * component item receives those classes like any attribute — it must render
 * them on its root.
 */
export interface PixelEqualHeightGridProps extends Omit<PixelGridProps, 'align'> {
  /** `stretch` gives every item of a row the row's height; `top` keeps their own. */
  rowAlign?: EqualHeightGridRowAlign;
}

const props = withDefaults(defineProps<PixelEqualHeightGridProps>(), {
  cols: undefined,
  rows: undefined,
  gap: 4,
  colGap: undefined,
  rowGap: undefined,
  autoFit: false,
  autoFill: false,
  minColWidth: '16rem',
  justify: undefined,
  as: 'div',
  surface: undefined,
  rowAlign: 'stretch',
});
const slots = defineSlots<{
  /** The items: each element or component, laid out as header, body and footer. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => equalHeightGridClasses(surface.value, props.rowAlign));

// Like React's cloneElement: elements and components get the item classes,
// text passes through as is.
const Items = () =>
  slotNodes(slots.default?.()).map((node) =>
    typeof node.type === 'symbol' ? node : cloneVNode(node, { class: equalHeightGridItemClasses }),
  );
</script>

<template>
  <PixelGrid
    :cols="cols"
    :rows="rows"
    :gap="gap"
    :col-gap="colGap"
    :row-gap="rowGap"
    :auto-fit="autoFit"
    :auto-fill="autoFill"
    :min-col-width="minColWidth"
    align="stretch"
    :justify="justify"
    :as="as"
    :surface="surface"
    :class="classes"
  >
    <Items />
  </PixelGrid>
</template>
