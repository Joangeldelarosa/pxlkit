<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  TESTIMONIAL_VERIFIED_LABEL,
  TESTIMONIAL_VERIFIED_TEXT,
  testimonialAttribution,
  testimonialCardClasses,
  testimonialHasStars,
  testimonialInitials,
  type Surface,
  type TestimonialAvatar,
  type TestimonialQuoteSize,
  type TestimonialVariant,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelStarRating from './PixelStarRating.vue';

/**
 * Testimonial card (`<article>`): a star rating and a verified badge (an
 * image named "Verified"), the quote in a `<blockquote>`, actions, and the
 * attribution — name, role and company — beside a photo or the initials.
 * The quote keeps a minimum height, so cards in a row line up. Attributes go
 * to the article.
 *
 * @example
 * <PixelTestimonialCard quote="Shipped in a week." name="Ana Pereira" role="PM" :stars="5" verified>
 *   <template #actions><PixelTextLink href="/stories/ana">Read the story</PixelTextLink></template>
 * </PixelTestimonialCard>
 */
export interface PixelTestimonialCardProps {
  /** The quote, set between curly quotation marks. */
  quote: string;
  /** Who said it. */
  name: string;
  /** Their role, before the company. */
  role?: string;
  /** Their company. */
  company?: string;
  /** Photo, or the name and tone of the initials; the initials of `name` without one. */
  avatar?: TestimonialAvatar;
  /** Star rating out of 5; none for 0 or unset. */
  stars?: number;
  /** Shows the VERIFIED badge. */
  verified?: boolean;
  /** Tone of the initials. */
  tone?: ToneKey;
  /** `card` draws the surface chrome; `quote` and `slider` leave it out. */
  variant?: TestimonialVariant;
  /** Minimum height of the quote. */
  quoteSize?: TestimonialQuoteSize;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelTestimonialCardProps>(), {
  role: undefined,
  company: undefined,
  avatar: undefined,
  stars: undefined,
  verified: false,
  tone: 'neutral',
  variant: 'card',
  quoteSize: 'normal',
  surface: undefined,
});
defineSlots<{
  /** Actions under the quote (a link to the full story). */
  actions?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  testimonialCardClasses(surface.value, {
    variant: props.variant,
    tone: props.tone,
    avatarTone: props.avatar?.tone,
    quoteSize: props.quoteSize,
  }),
);
const attribution = computed(() => testimonialAttribution(props.role, props.company));
</script>

<template>
  <article :class="classes.root">
    <div :class="classes.header">
      <div :class="classes.stars">
        <PixelStarRating v-if="testimonialHasStars(stars)" :model-value="stars" size="sm" tone="gold" :surface="surface" />
      </div>
      <span
        v-if="verified"
        data-pxl-verified="true"
        role="img"
        :class="classes.verified"
        :aria-label="TESTIMONIAL_VERIFIED_LABEL"
      >
        <PixelGlyph name="check" :class="classes.verifiedIcon" />
        <span>{{ TESTIMONIAL_VERIFIED_TEXT }}</span>
      </span>
    </div>
    <div data-pxl-quote-slot="true" :class="classes.quoteRow">
      <blockquote :class="classes.quote">&ldquo;{{ quote }}&rdquo;</blockquote>
    </div>
    <div :class="classes.actionsRow">
      <div v-if="$slots.actions" :class="classes.actions"><slot name="actions" /></div>
    </div>
    <div :class="classes.attribution">
      <span data-pxl-avatar="true" :class="classes.avatar" :aria-hidden="avatar?.src ? undefined : 'true'">
        <img v-if="avatar?.src" :src="avatar.src" :alt="avatar.name" :class="classes.avatarImage" />
        <span v-else>{{ testimonialInitials(avatar?.name ?? name) }}</span>
      </span>
      <div :class="classes.person">
        <span :class="classes.name">{{ name }}</span>
        <span v-if="attribution" :class="classes.role">{{ attribution }}</span>
      </div>
      <span :class="classes.toneHint" aria-hidden="true" />
    </div>
  </article>
</template>
