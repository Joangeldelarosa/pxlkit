<script setup lang="ts">
import { computed, useId, useTemplateRef, warn, watch, type VNode } from 'vue';
import {
  overlayBackdropClasses,
  sheetClasses,
  sheetLayerClasses,
  type SheetSide,
  type SheetSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEscape, useFocusTrap, useScrollLock } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/**
 * Mobile-first modal sheet docked to the bottom or the top of the viewport,
 * with focus trap, scroll lock, Escape / backdrop dismissal and an optional
 * (decorative) drag handle. Name it with `title` or `aria-label`. Bind it
 * with `v-model:open`.
 *
 * @example
 * <PixelSheet v-model:open="open" title="Quick actions" drag-handle>
 *   <p>Sheet content.</p>
 * </PixelSheet>
 */
export interface PixelSheetProps {
  /** Whether the sheet is visible (`v-model:open`). */
  open: boolean;
  /** Edge of the viewport the sheet is docked to. */
  side?: SheetSide;
  /** Height preset. */
  size?: SheetSize;
  /** Draw a drag handle affordance (decorative). */
  dragHandle?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Title shown at the top; it names the dialog. */
  title?: string;
  /** Text under the title, wired via `aria-describedby`. */
  description?: string;
  /**
   * Accessible name when there is no `title` — every dialog needs one
   * (WCAG 4.1.2).
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelSheetProps>(), {
  side: 'bottom',
  size: 'md',
  dragHandle: false,
  surface: undefined,
  title: undefined,
  description: undefined,
  ariaLabel: undefined,
});
const emit = defineEmits<{
  /** `false` when the sheet asks to close (Escape, backdrop), for `v-model:open`. */
  'update:open': [open: boolean];
}>();
defineSlots<{
  /** Body content. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const titleId = useId();
const descriptionId = useId();
const panel = useTemplateRef<HTMLElement>('panel');
const classes = computed(() => sheetClasses(surface.value, props.side, props.size));
const backdropClasses = overlayBackdropClasses('absolute');

const close = () => emit('update:open', false);

useFocusTrap(() => props.open, panel);
useScrollLock(() => props.open);
useEscape(close, () => props.open);

watch(
  () => props.open && !props.title && !props.ariaLabel,
  (unnamed) => {
    if (unnamed) warn('[PixelSheet] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
  },
  { immediate: true },
);

defineExpose({
  /** The sheet panel while it is open. */
  element: panel,
});
</script>

<template>
  <PixelPortal v-if="open">
    <div :class="sheetLayerClasses" data-pixel-sheet="">
      <div aria-hidden="true" data-pxl-overlay-backdrop="" :class="backdropClasses" @click="close" />
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-label="title ? undefined : ariaLabel"
        :aria-labelledby="title ? titleId : undefined"
        :aria-describedby="description ? descriptionId : undefined"
        :data-side="side"
        :data-size="size"
        :class="classes.panel"
      >
        <!-- On a top sheet the handle is drawn last, next to its free edge. -->
        <div v-if="dragHandle" data-testid="pixel-sheet-drag-handle" aria-hidden="true" :class="classes.handle">
          <span :class="classes.handleBar" />
        </div>
        <div v-if="title || description" :class="classes.header">
          <h4 v-if="title" :id="titleId" :class="classes.title">{{ title }}</h4>
          <p v-if="description" :id="descriptionId" :class="classes.description">{{ description }}</p>
        </div>
        <div :class="classes.body"><slot /></div>
      </div>
    </div>
  </PixelPortal>
</template>
