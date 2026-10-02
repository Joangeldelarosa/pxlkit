<script setup lang="ts">
import { computed, useAttrs, type VNode } from 'vue';
import {
  chipClasses,
  chipDeleteLabel,
  type PixelBadgeVariant,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Compact label tag with the badge variants, sizes and an optional leading
 * icon. With a `click` listener it renders a `<button type="button">`
 * instead of a `<span>`; with a `delete` listener it shows a delete (×)
 * button (named "Remove <label>") that does not trigger the chip's click.
 * A button cannot contain a button, so a chip with both is a `<span>` frame
 * around two sibling buttons, the label and the ×: the frame takes the
 * `class`, the label button every other attribute and listener.
 */
export interface PixelChipProps {
  /** Chip label. */
  label: string;
  /** Selection value read by a wrapping `PixelChipGroup`; never rendered. */
  value?: string;
  /** Tone tint. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Variant axis shared with PixelBadge. */
  variant?: PixelBadgeVariant;
  /** Size scale. */
  size?: Size;
  /** `false` hides the delete button even with a `delete` listener. */
  deletable?: boolean;
  /**
   * Click handler (`@click`). Declared as a prop because its presence changes
   * the element: with one the chip is a `<button type="button">`.
   */
  onClick?: (event: MouseEvent) => void;
  /**
   * Delete handler (`@delete`), called by the delete button. Declared as a
   * prop because its presence shows that button.
   */
  onDelete?: () => void;
  /** Legacy alias of `onDelete` (`@remove`). */
  onRemove?: () => void;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelChipProps>(), {
  value: undefined,
  tone: 'cyan',
  surface: undefined,
  variant: 'soft',
  size: 'md',
  deletable: undefined,
});
defineSlots<{
  /** Leading icon. */
  'icon-left'?(): VNode[];
}>();

const attrs = useAttrs();
const surface = useEffectiveSurface(() => props.surface);
const interactive = computed(() => props.onClick !== undefined);
const removeHandler = computed(() => props.onDelete ?? props.onRemove);
const deletes = computed(() => removeHandler.value !== undefined && props.deletable !== false);
const classes = computed(() =>
  chipClasses(surface.value, {
    tone: props.tone,
    variant: props.variant,
    size: props.size,
    interactive: interactive.value,
  }),
);
const actionAttrs = computed(() => {
  const { class: _class, ...others } = attrs;
  return others;
});

function remove(event: MouseEvent) {
  // A delete is not a click of the chip, nor of whatever holds it.
  event.stopPropagation();
  removeHandler.value?.();
}
</script>

<template>
  <span v-if="interactive && deletes" :class="[classes.frame, attrs.class]">
    <button type="button" data-chip-action="" :class="classes.action" v-bind="actionAttrs" @click="onClick">
      <span v-if="$slots['icon-left']" :class="classes.icon"><slot name="icon-left" /></span>
      <span>{{ label }}</span>
    </button>
    <button type="button" :class="classes.deleteButton" :aria-label="chipDeleteLabel(label)" @click="remove">
      <PixelGlyph name="close" :class="classes.deleteIcon" />
    </button>
  </span>
  <component
    :is="interactive ? 'button' : 'span'"
    v-else
    :type="interactive ? 'button' : undefined"
    :class="classes.root"
    v-bind="attrs"
    @click="onClick"
  >
    <span v-if="$slots['icon-left']" :class="classes.icon"><slot name="icon-left" /></span>
    <span>{{ label }}</span>
    <button v-if="deletes" type="button" :class="classes.deleteButton" :aria-label="chipDeleteLabel(label)" @click="remove">
      <PixelGlyph name="close" :class="classes.deleteIcon" />
    </button>
  </component>
</template>
