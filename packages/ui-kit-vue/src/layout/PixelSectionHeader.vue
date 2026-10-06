<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  sectionHeaderClasses,
  type SectionHeaderAlign,
  type SectionHeaderLevel,
  type SectionHeaderSize,
  type SectionHeaderSpacing,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * `<header>` above a section: an eyebrow, the heading, a description and
 * actions. The eyebrow is decorative (`aria-hidden`) and repeated for screen
 * readers inside the heading.
 */
export interface PixelSectionHeaderProps {
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** The heading. */
  title: string;
  /** Tone of the title and eyebrow. */
  titleTone?: ToneKey;
  /** Paragraph under the title. */
  description?: string;
  /** Start-aligned, or centred with a capped width. */
  align?: SectionHeaderAlign;
  /** Type scale. */
  size?: SectionHeaderSize;
  /** Gaps between the blocks. */
  spacing?: SectionHeaderSpacing;
  /** Heading level of the title. */
  as?: SectionHeaderLevel;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelSectionHeaderProps>(), {
  eyebrow: undefined,
  titleTone: undefined,
  description: undefined,
  align: 'start',
  size: 'md',
  spacing: 'normal',
  as: 'h2',
  surface: undefined,
});
defineSlots<{
  /** Buttons or links under the description. */
  actions?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  sectionHeaderClasses(surface.value, {
    titleTone: props.titleTone,
    align: props.align,
    size: props.size,
    spacing: props.spacing,
    eyebrow: Boolean(props.eyebrow),
  }),
);
</script>

<template>
  <header :class="classes.header">
    <div :class="classes.stack">
      <span v-if="eyebrow" aria-hidden="true" :class="classes.eyebrow">{{ eyebrow }}</span>
      <component :is="as" :class="classes.title">
        <span v-if="eyebrow" class="sr-only">{{ `${eyebrow}: ` }}</span>{{ title }}
      </component>
      <p v-if="description" :class="classes.description">{{ description }}</p>
      <div v-if="$slots.actions" :class="classes.actions"><slot name="actions" /></div>
    </div>
  </header>
</template>
