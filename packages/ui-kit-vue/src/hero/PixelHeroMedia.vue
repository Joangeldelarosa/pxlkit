<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  cn,
  heroMediaBodyClasses,
  heroMediaCaptionClasses,
  heroMediaClasses,
  heroMediaRatios,
  type HeroMediaAnchor,
  type HeroMediaRatio,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * A `<figure>` that holds hero media at a fixed aspect ratio, reserving its
 * box before the media loads, with an optional tone frame and a
 * `<figcaption>`. The media goes in the default slot; a `style` of your own
 * can override the aspect ratio.
 */
export interface PixelHeroMediaProps {
  /** Aspect ratio of the figure. */
  ratio?: HeroMediaRatio;
  /** Centred across its row, or on the row's end beside a headline. */
  anchor?: HeroMediaAnchor;
  /** Draw the surface border and radius in the tone's border colour. */
  framed?: boolean;
  /** Tone of the frame. */
  tone?: ToneKey;
  /** Caption under the media, in a `<figcaption>`. */
  caption?: string;
  /** Extra classes for the caption (the React kit's `captionClassName`). */
  captionClass?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelHeroMediaProps>(), {
  ratio: '16/10',
  anchor: 'center',
  framed: false,
  tone: 'neutral',
  caption: undefined,
  captionClass: undefined,
  surface: undefined,
});
defineSlots<{
  /** The media. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  heroMediaClasses(surface.value, { anchor: props.anchor, framed: props.framed, tone: props.tone }),
);
const captionClasses = computed(() => cn(heroMediaCaptionClasses(surface.value), props.captionClass));
</script>

<template>
  <figure :class="classes" :style="{ aspectRatio: heroMediaRatios[ratio] }">
    <div :class="heroMediaBodyClasses"><slot /></div>
    <figcaption v-if="caption" :class="captionClasses">{{ caption }}</figcaption>
  </figure>
</template>
