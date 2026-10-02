<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  sectionClasses,
  type ContainerWidth,
  type PageGutter,
  type SectionRhythmKey,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { usePxlKitLocale } from '../composables/locale.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelCenter from './PixelCenter.vue';

/**
 * Page `<section>` with an optional uppercase title row and subtitle; its
 * content sits in a centred column (`PixelCenter`) or across the full width.
 */
export interface PixelSectionProps {
  /** Heading row at the top of the section, upper-cased for the locale. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Width of the centred column (`containerWidth`), or `false` for the full width. */
  container?: ContainerWidth | false;
  /** Vertical padding (`sectionRhythm`). */
  verticalPadding?: SectionRhythmKey;
  /** Horizontal padding (`pageGutter`) of the column, or of the section without one. */
  horizontalGutter?: PageGutter;
  /** Surface border, radius and card tint. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelSectionProps>(), {
  title: undefined,
  subtitle: undefined,
  surface: undefined,
  container: '5xl',
  verticalPadding: 'xl',
  horizontalGutter: 'lg',
  bordered: false,
});
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
const classes = computed(() =>
  sectionClasses(surface.value, {
    bordered: props.bordered,
    verticalPadding: props.verticalPadding,
    container: props.container,
    horizontalGutter: props.horizontalGutter,
  }),
);
</script>

<template>
  <section :class="classes.section">
    <PixelCenter v-if="container" :max-width="container" :gutter="horizontalGutter" :surface="surface">
      <div v-if="title" class="mb-4">
        <h3 :class="classes.title">{{ locale.upper(title) }}</h3>
        <p v-if="subtitle" :class="classes.subtitle">{{ subtitle }}</p>
      </div>
      <slot />
    </PixelCenter>
    <template v-else>
      <div v-if="title" class="mb-4">
        <h3 :class="classes.title">{{ locale.upper(title) }}</h3>
        <p v-if="subtitle" :class="classes.subtitle">{{ subtitle }}</p>
      </div>
      <slot />
    </template>
  </section>
</template>
