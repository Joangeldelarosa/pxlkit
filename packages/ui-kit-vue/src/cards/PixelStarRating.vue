<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { PxlKitIcon } from '@pxlkit/vue';
import { Star } from '@pxlkit/gamification';
import {
  STAR_RATING_ICON_LABEL,
  STAR_RATING_MUTED_COLOR,
  starRatingButtonLabel,
  starRatingClasses,
  starRatingLabel,
  starRatingSizes,
  starRatingStarClasses,
  starRatingStars,
  starRatingToneColors,
  starRatingValue,
  type StarRatingSize,
  type StarRatingTone,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Star rating: `max` stars, the rating's filled in the tone — the
 * gamification Star icon, at 16, 20 or 24 px. Read-only it is one image
 * (`role="img"`) named "N out of M"; `interactive` makes each star a button
 * (`aria-pressed` while filled) in a named group, and clicking one rates.
 * Bind the rating with `v-model`, or leave it uncontrolled from
 * `default-value`. The `star-icon` and `empty-star-icon` slots draw other
 * glyphs (a heart, a coin) for the filled and the empty stars. Attributes go
 * to the rating.
 *
 * @example
 * <PixelStarRating v-model="rating" interactive show-count />
 * <PixelStarRating :model-value="4">
 *   <template #star-icon="{ size }"><PxlKitIcon :icon="Heart" :size="size" appearance="solid" color="#EF4444" /></template>
 * </PixelStarRating>
 */
export interface PixelStarRatingProps {
  /** The rating (`v-model`), from 0 to `max`; leave unset for an uncontrolled rating. */
  modelValue?: number;
  /** Initial rating while uncontrolled. */
  defaultValue?: number;
  /** Number of stars. */
  max?: number;
  /** Star size: 16, 20 or 24 px. */
  size?: StarRatingSize;
  /** Colour of the filled stars. */
  tone?: StarRatingTone;
  /** Shows "N/M" beside the stars. */
  showCount?: boolean;
  /** Makes each star a button that rates. */
  interactive?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelStarRatingProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  max: 5,
  size: 'md',
  tone: 'gold',
  showCount: false,
  interactive: false,
  surface: undefined,
});

const emit = defineEmits<{
  /** The rating of the star the user clicked. */
  'update:modelValue': [value: number];
}>();

/** What a custom glyph is drawn with. */
interface StarIconProps {
  filled: boolean;
  /** Width and height, in px. */
  size: number;
  tone: StarRatingTone;
}

defineSlots<{
  /** Glyph of the filled stars, in place of the Star icon. */
  'star-icon'?(props: StarIconProps): VNode[];
  /** Glyph of the empty stars, in place of the dimmed Star icon. */
  'empty-star-icon'?(props: StarIconProps): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [value, setValue] = useControllableState<number>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? 0,
  onChange: (next) => emit('update:modelValue', next),
});

const rating = computed(() => starRatingValue(value.value, props.max));
const px = computed(() => starRatingSizes[props.size]);
const classes = computed(() => starRatingClasses(surface.value));
function rate(next: number) {
  if (props.interactive) setValue(next);
}

const stars = computed(() =>
  starRatingStars(rating.value, props.max).map((star) => ({
    ...star,
    class: starRatingStarClasses(surface.value, { interactive: props.interactive, filled: star.filled, tone: props.tone }),
  })),
);
</script>

<template>
  <div
    :role="interactive ? 'group' : 'img'"
    :aria-label="starRatingLabel(rating, max, interactive)"
    :class="classes.root"
  >
    <span :class="classes.stars">
      <component
        :is="interactive ? 'button' : 'span'"
        v-for="star in stars"
        :key="star.value"
        :type="interactive ? 'button' : undefined"
        :data-pxl-star="star.filled ? 'filled' : 'outlined'"
        :aria-label="interactive ? starRatingButtonLabel(star.value, max) : undefined"
        :aria-pressed="interactive ? star.filled : undefined"
        :class="star.class"
        @click="rate(star.value)"
      >
        <slot v-if="star.filled" name="star-icon" :filled="true" :size="px" :tone="tone">
          <PxlKitIcon
            :icon="Star"
            :size="px"
            appearance="solid"
            :color="starRatingToneColors[tone]"
            :aria-label="STAR_RATING_ICON_LABEL"
          />
        </slot>
        <slot v-else name="empty-star-icon" :filled="false" :size="px" :tone="tone">
          <span :class="classes.muted">
            <PxlKitIcon
              :icon="Star"
              :size="px"
              appearance="solid"
              :color="STAR_RATING_MUTED_COLOR"
              :aria-label="STAR_RATING_ICON_LABEL"
            />
          </span>
        </slot>
      </component>
    </span>
    <span v-if="showCount" :class="classes.count">{{ rating }}/{{ max }}</span>
  </div>
</template>
