<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  PRICING_PREVIOUS_PRICE_LABEL,
  pricingCardClasses,
  pricingFeature,
  pricingPopularLabel,
  type PricingCardDescriptionLines,
  type PricingCardFeature,
  type PricingCardPopular,
  type PricingCardPrice,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Pricing tier card (`<article>`): an optional popular ribbon over the top
 * edge, the plan name and description, the price with an optional old price
 * struck through and a badge beside it, the feature list — included features
 * checked, excluded ones crossed out, both announced as such — and a call to
 * action. The ribbon row and the description keep their height when empty,
 * so tiers side by side line up. Attributes go to the article.
 *
 * @example
 * <PixelPricingCard name="Pro" tone="gold" highlight :price="{ amount: '$49', period: '/mo' }" :popular="{}">
 *   <template #cta><PixelButton tone="gold" full-width>Upgrade</PixelButton></template>
 * </PixelPricingCard>
 */
export interface PixelPricingCardProps {
  /** Plan name. */
  name: string;
  /** Price, billing period and old price. */
  price: PricingCardPrice;
  /** Muted line under the name. */
  description?: string;
  /** Lines the description is clamped to, or `none` to let it flow. */
  descriptionLines?: PricingCardDescriptionLines;
  /** Ribbon over the top edge: its label (`POPULAR`) and tone (gold). */
  popular?: PricingCardPopular;
  /** The feature list. */
  features?: PricingCardFeature[];
  /** Tone of the price, the feature marks and, highlighted, the chrome. */
  tone?: ToneKey;
  /** Tints the border and background and adds a glow. */
  highlight?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border, radius and background. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelPricingCardProps>(), {
  description: undefined,
  descriptionLines: 2,
  popular: undefined,
  features: undefined,
  tone: 'neutral',
  highlight: false,
  surface: undefined,
  bordered: true,
});
defineSlots<{
  /** Icon above the name, in the tone. */
  icon?(): VNode[];
  /** Badge beside the price (a discount). */
  'price-badge'?(): VNode[];
  /** Call to action under the features. */
  cta?(): VNode[];
  /** Fine print under the call to action. */
  footer?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  pricingCardClasses(surface.value, {
    tone: props.tone,
    highlight: props.highlight,
    bordered: props.bordered,
    descriptionLines: props.descriptionLines,
    popularTone: props.popular?.tone,
  }),
);
const featureRows = computed(() =>
  (props.features ?? []).map((feature) => ({ feature, view: pricingFeature(feature, props.tone) })),
);
</script>

<template>
  <article :class="classes.root">
    <div data-pxl-ribbon-slot="true" :class="classes.ribbonRow">
      <span v-if="popular" :class="classes.popular">{{ pricingPopularLabel(popular) }}</span>
    </div>
    <div :class="classes.head">
      <span v-if="$slots.icon" :class="classes.icon" aria-hidden="true"><slot name="icon" /></span>
      <h3 :class="classes.name">{{ name }}</h3>
      <p data-pxl-description-slot="true" :class="classes.description">{{ description ?? '' }}</p>
    </div>
    <div :class="classes.priceRow">
      <s v-if="price.strikethrough !== undefined" :class="classes.previousPrice">
        <span class="sr-only">{{ PRICING_PREVIOUS_PRICE_LABEL }}</span>{{ price.strikethrough }}
      </s>
      <span :class="classes.amount">{{ price.amount }}</span>
      <span v-if="price.period" :class="classes.period">{{ price.period }}</span>
      <span v-if="$slots['price-badge']" data-pxl-price-badge-slot="true" :class="classes.priceBadge">
        <slot name="price-badge" />
      </span>
    </div>
    <ul v-if="featureRows.length > 0" :class="classes.features">
      <li v-for="({ feature, view }, index) in featureRows" :key="index" :class="classes.feature">
        <span :class="view.markClasses" aria-hidden="true"><PixelGlyph :name="view.glyph" /></span>
        <span :title="feature.tooltip" :class="view.labelClasses">
          <span class="sr-only">{{ view.srLabel }}</span>{{ feature.label }}
        </span>
      </li>
    </ul>
    <div :class="classes.spacer" aria-hidden="true" />
    <div v-if="$slots.cta" :class="classes.cta"><slot name="cta" /></div>
    <div v-if="$slots.footer" :class="classes.footer"><slot name="footer" /></div>
  </article>
</template>
