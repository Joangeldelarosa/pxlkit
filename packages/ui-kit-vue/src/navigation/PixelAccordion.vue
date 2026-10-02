<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import {
  accordionClasses,
  accordionIds,
  accordionInitialOpen,
  accordionItemClasses,
  toggleAccordionItem,
  type Surface,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** One item of a `PixelAccordion`. */
export interface AccordionItem {
  id: string;
  /** Header text. */
  title: string;
  /** Panel content: text, a VNode or a render function. */
  content: PxlNode;
}

/**
 * Stack of disclosure items: each header is a button reporting
 * `aria-expanded` that shows and hides its panel (`aria-controls`), which
 * refers back to it. One item is open at a time unless `allow-multiple`;
 * the first starts open unless `collapsed-by-default`. A closed panel is not
 * rendered.
 *
 * @example
 * <PixelAccordion :items="[{ id: 'faq', title: 'FAQ', content: 'Short answers.' }]" allow-multiple />
 */
export interface PixelAccordionProps {
  /** The items, in order. */
  items: AccordionItem[];
  /** Several items can be open at once. */
  allowMultiple?: boolean;
  /** Every item starts closed, instead of the first one open. */
  collapsedByDefault?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelAccordionProps>(), {
  allowMultiple: false,
  collapsedByDefault: false,
  surface: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const baseId = useId();
const open = ref(accordionInitialOpen(props.items, props.collapsedByDefault));
const rows = computed(() =>
  props.items.map((item) => {
    const isOpen = open.value.includes(item.id);
    return { item, open: isOpen, ids: accordionIds(baseId, item.id), classes: accordionItemClasses(surface.value, isOpen) };
  }),
);

function toggle(id: string) {
  open.value = toggleAccordionItem(open.value, id, props.allowMultiple);
}
</script>

<template>
  <div :class="accordionClasses">
    <div v-for="row in rows" :key="row.item.id" :class="row.classes.item">
      <button
        :id="row.ids.header"
        type="button"
        :aria-expanded="row.open"
        :aria-controls="row.ids.panel"
        :class="row.classes.trigger"
        @click="toggle(row.item.id)"
      >
        <span>{{ row.item.title }}</span>
        <PixelGlyph name="chevronDown" :class="row.classes.chevron" />
      </button>
      <div v-if="row.open" :id="row.ids.panel" :class="row.classes.panel">
        <RenderNode :node="row.item.content" />
      </div>
    </div>
  </div>
</template>
