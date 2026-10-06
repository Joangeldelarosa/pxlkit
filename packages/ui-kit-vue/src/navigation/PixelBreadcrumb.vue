<script setup lang="ts">
import { computed } from 'vue';
import {
  breadcrumbChevron,
  breadcrumbClasses,
  breadcrumbCrumbKind,
  breadcrumbCurrentClasses,
  breadcrumbItemClasses,
  breadcrumbLinkClasses,
  breadcrumbListClasses,
  breadcrumbSlashClasses,
  breadcrumbTextClasses,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** One crumb of a `PixelBreadcrumb`. */
export interface PixelBreadcrumbItem {
  /** Visible label. */
  label: string;
  /** Link target: the crumb is an `<a>`, unless it also has `onClick`. */
  href?: string;
  /** Click handler: the crumb is a `<button>` (wins over `href`). */
  onClick?: () => void;
  /** The current page: plain text marked `aria-current="page"`. */
  active?: boolean;
}

/**
 * Trail of the user's location in a `<nav>` landmark: an ordered list of
 * crumbs separated by a pixel chevron (pixel surface) or a slash (linear
 * surface), both hidden from assistive technology.
 *
 * @example
 * <PixelBreadcrumb :items="[{ label: 'Home', href: '/' }, { label: 'Docs', active: true }]" />
 */
export interface PixelBreadcrumbProps {
  /** Crumbs in order, from the root to the current page. */
  items: PixelBreadcrumbItem[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name of the landmark. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelBreadcrumbProps>(), {
  surface: undefined,
  ariaLabel: 'Breadcrumb',
});

const surface = useEffectiveSurface(() => props.surface);
const crumbs = computed(() => props.items.map((item) => ({ item, kind: breadcrumbCrumbKind(item) })));
</script>

<template>
  <nav :aria-label="ariaLabel" :class="breadcrumbClasses(surface)">
    <ol :class="breadcrumbListClasses">
      <li v-for="({ item, kind }, index) in crumbs" :key="index" :class="breadcrumbItemClasses">
        <template v-if="index > 0">
          <svg
            v-if="surface === 'pixel'"
            :viewBox="breadcrumbChevron.viewBox"
            :class="breadcrumbChevron.className"
            shape-rendering="crispEdges"
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            :style="breadcrumbChevron.style"
          >
            <rect
              v-for="[x, y, width, height] in breadcrumbChevron.rects"
              :key="`${x}-${y}`"
              :x="x"
              :y="y"
              :width="width"
              :height="height"
            />
          </svg>
          <span v-else aria-hidden="true" :class="breadcrumbSlashClasses">/</span>
        </template>
        <span v-if="kind === 'current'" aria-current="page" :class="breadcrumbCurrentClasses">{{ item.label }}</span>
        <button v-else-if="kind === 'button'" type="button" :class="breadcrumbLinkClasses" @click="item.onClick">
          {{ item.label }}
        </button>
        <a v-else-if="kind === 'link'" :href="item.href" :class="breadcrumbLinkClasses">{{ item.label }}</a>
        <span v-else :class="breadcrumbTextClasses">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
