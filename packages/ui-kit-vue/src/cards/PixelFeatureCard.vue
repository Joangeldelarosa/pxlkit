<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  featureCardClasses,
  isCardActivationKey,
  type CardBadge,
  type FeatureCardDescriptionLines,
  type FeatureCardIconSize,
  type FeatureCardOrientation,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Feature highlight card: a badge row, a toned icon frame, a title clamped to
 * two lines, a clamped description and a footer, stacked or with the icon
 * beside the text. The badge row keeps its height without a badge and the
 * clamps reserve their lines, so cards in a grid line up. It is an
 * `<article>`; with an `href` an `<a>` (the whole card is the link: keep
 * buttons and links out of it), and `interactive` without one a
 * `<div role="button">` in the tab order, which Enter and Space activate.
 * Attributes and listeners go to the card, and a `keydown` listener that
 * calls `preventDefault()` keeps Enter or Space from activating it.
 *
 * @example
 * <PixelFeatureCard title="Realtime sync" description="Push every keystroke to peers." tone="cyan">
 *   <template #icon><SyncIcon /></template>
 * </PixelFeatureCard>
 */
export interface PixelFeatureCardProps {
  /** The heading, clamped to two lines. */
  title: string;
  /** Muted paragraph under the title. */
  description?: string;
  /** Lines the description is clamped to; 3 when unset. */
  descriptionLines?: FeatureCardDescriptionLines;
  /** @deprecated Use `description`. */
  desc?: string;
  /** @deprecated Use `descriptionLines`. */
  descLines?: FeatureCardDescriptionLines;
  /** Width of the icon frame, in px. */
  iconSize?: FeatureCardIconSize;
  /** Badge above the icon: its label and tone (cyan by default). */
  badge?: CardBadge;
  /** Tone of the icon frame. */
  tone?: ToneKey;
  /** Hover lift and focus ring; without an `href` the card is a button: give it a `click` listener. */
  interactive?: boolean;
  /** Makes the card a link. */
  href?: string;
  /** Link target, with `href`. */
  target?: string;
  /** Link relationship, with `href`. */
  rel?: string;
  /** Downloads the link target, with `href`. */
  download?: string;
  /** Icon above the text, or beside it. */
  orientation?: FeatureCardOrientation;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border, radius and background. */
  bordered?: boolean;
  /**
   * Click handler (`@click`). Declared as a prop because an interactive card
   * calls it on Enter and Space too, with the keyboard event.
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void;
}

// The attributes are bound between the card's own attributes and listeners:
// the consumer's attributes win, and its keydown listener runs first, so it
// can keep the card from activating.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelFeatureCardProps>(), {
  description: undefined,
  descriptionLines: undefined,
  desc: undefined,
  descLines: undefined,
  iconSize: 56,
  badge: undefined,
  tone: 'neutral',
  interactive: false,
  href: undefined,
  target: undefined,
  rel: undefined,
  download: undefined,
  orientation: 'vertical',
  surface: undefined,
  bordered: true,
});
defineSlots<{
  /** Content after the card's own, inside the card. */
  default?(): VNode[];
  /** Icon in the toned frame. */
  icon?(): VNode[];
  /** Footer under the description. */
  footer?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const link = computed(() => props.href !== undefined);
const button = computed(() => props.interactive && !link.value);
const horizontal = computed(() => props.orientation === 'horizontal');
const description = computed(() => props.description ?? props.desc);
const classes = computed(() =>
  featureCardClasses(surface.value, {
    tone: props.tone,
    orientation: props.orientation,
    bordered: props.bordered,
    interactive: props.interactive || link.value,
    iconSize: props.iconSize,
    badge: props.badge,
    descriptionLines: props.descriptionLines ?? props.descLines,
  }),
);

function activate(event: KeyboardEvent) {
  if (event.defaultPrevented || !button.value || !isCardActivationKey(event.key)) return;
  event.preventDefault();
  props.onClick?.(event);
}
</script>

<template>
  <component
    :is="link ? 'a' : button ? 'div' : 'article'"
    :href="link ? href : undefined"
    :target="link ? target : undefined"
    :rel="link ? rel : undefined"
    :download="link ? download : undefined"
    :role="button ? 'button' : undefined"
    :tabindex="button ? 0 : undefined"
    :class="classes.root"
    v-bind="$attrs"
    @click="onClick"
    @keydown="activate"
  >
    <div data-pxl-badge-slot="true" :class="classes.badgeRow">
      <span v-if="badge" :class="classes.badge">{{ badge.label }}</span>
    </div>
    <div v-if="$slots.icon" data-pxl-icon-frame="true" :class="classes.icon"><slot name="icon" /></div>
    <div v-if="horizontal" :class="classes.column">
      <h3 :class="classes.title">{{ title }}</h3>
      <p v-if="description" :class="classes.description">{{ description }}</p>
      <div v-if="$slots.footer" :class="classes.footer"><slot name="footer" /></div>
    </div>
    <template v-else>
      <h3 :class="classes.title">{{ title }}</h3>
      <p v-if="description" :class="classes.description">{{ description }}</p>
      <div :class="classes.spacer" />
      <div v-if="$slots.footer" :class="classes.footer"><slot name="footer" /></div>
    </template>
    <slot />
  </component>
</template>
