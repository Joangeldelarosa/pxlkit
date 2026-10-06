<script setup lang="ts">
import { computed } from 'vue';
import {
  PAGINATION_ELLIPSIS,
  paginationClasses,
  paginationEllipsisClasses,
  paginationPageClasses,
  paginationStepClasses,
  paginationSteps,
  paginationWindow,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Page navigator in a `<nav>` landmark: Prev, a window of page numbers around
 * the current page (the first and last always shown, `…` for the gaps) and
 * Next, disabled at the ends. The current page carries `aria-current="page"`.
 * Bind the page with `v-model:page`.
 *
 * @example
 * <PixelPagination v-model:page="page" :total="20" />
 */
export interface PixelPaginationProps {
  /** Current page, from 1 (`v-model:page`). */
  page: number;
  /** Number of pages. */
  total: number;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name of the landmark. */
  ariaLabel?: string;
  /** Label of the previous-page button. */
  prevLabel?: string;
  /** Label of the next-page button. */
  nextLabel?: string;
}

const props = withDefaults(defineProps<PixelPaginationProps>(), {
  siblings: 1,
  surface: undefined,
  ariaLabel: 'Pagination',
  prevLabel: 'Prev',
  nextLabel: 'Next',
});
const emit = defineEmits<{
  /** The page the user picked, for `v-model:page`. */
  'update:page': [page: number];
}>();

const surface = useEffectiveSurface(() => props.surface);
const pages = computed(() => paginationWindow(props.page, props.total, props.siblings));
const steps = computed(() => paginationSteps(props.page, props.total));
</script>

<template>
  <nav :aria-label="ariaLabel" :class="paginationClasses">
    <button
      type="button"
      :disabled="steps.prev.disabled"
      :aria-label="prevLabel"
      :class="paginationStepClasses(surface, steps.prev.disabled)"
      @click="emit('update:page', steps.prev.page)"
    >
      {{ prevLabel }}
    </button>
    <template v-for="(entry, index) in pages" :key="entry === PAGINATION_ELLIPSIS ? `ell-${index}` : entry">
      <span v-if="entry === PAGINATION_ELLIPSIS" aria-hidden="true" :class="paginationEllipsisClasses(surface)">
        {{ PAGINATION_ELLIPSIS }}
      </span>
      <button
        v-else
        type="button"
        :aria-current="entry === page ? 'page' : undefined"
        :class="paginationPageClasses(surface, entry === page)"
        @click="emit('update:page', entry)"
      >
        {{ entry }}
      </button>
    </template>
    <button
      type="button"
      :disabled="steps.next.disabled"
      :aria-label="nextLabel"
      :class="paginationStepClasses(surface, steps.next.disabled)"
      @click="emit('update:page', steps.next.page)"
    >
      {{ nextLabel }}
    </button>
  </nav>
</template>
