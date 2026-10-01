<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, type VNode } from 'vue';
import {
  modalClasses,
  modalLayerClasses,
  overlayBackdropClasses,
  type ModalSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { usePxlKitLocale } from '../composables/locale.js';
import { useReducedMotion } from '../composables/media-query.js';
import { useEscape, useFocusTrap, useScrollLock } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/**
 * Centered modal dialog with a title bar, optional description and footer,
 * surface-aware chrome (the pixel surface draws an old-school window), focus
 * trap, scroll lock and Escape / backdrop dismissal. Bind it with
 * `v-model:open`, or pass `open` and listen to `close`.
 *
 * @example
 * <PixelModal v-model:open="open" title="Save changes?">
 *   <p>Your edits are not saved yet.</p>
 *   <template #footer><PixelButton @click="open = false">Save</PixelButton></template>
 * </PixelModal>
 */
export interface PixelModalProps {
  /** Whether the modal is visible (`v-model:open`). */
  open: boolean;
  /** Title shown in the header; it names the dialog. */
  title: string;
  /** Width preset. */
  size?: ModalSize;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible label of the close button. */
  closeLabel?: string;
  /**
   * Awaited before the modal closes — the close button shows a busy state
   * meanwhile. Lets you persist or animate out first.
   */
  asyncClose?: () => Promise<void>;
  /** Portal target; `document.body` when left out. */
  container?: HTMLElement | null;
}

const props = withDefaults(defineProps<PixelModalProps>(), {
  size: 'md',
  surface: undefined,
  closeLabel: 'Close',
  asyncClose: undefined,
  container: undefined,
});
const emit = defineEmits<{
  /** The user asked to close the modal (close button, Escape, backdrop). */
  close: [];
  /** `false` when the modal asks to close, for `v-model:open`. */
  'update:open': [open: boolean];
}>();
defineSlots<{
  /** Body content. */
  default?(): VNode[];
  /** Description under the title, wired via `aria-describedby`. */
  description?(): VNode[];
  /** Actions at the bottom, set off by a divider. */
  footer?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
const reducedMotion = useReducedMotion();
const titleId = useId();
const descriptionId = useId();
const panel = useTemplateRef<HTMLElement>('panel');
const closing = ref(false);

const classes = computed(() =>
  modalClasses(surface.value, props.size, { closing: closing.value, reducedMotion: reducedMotion.value }),
);

function close() {
  emit('close');
  emit('update:open', false);
}

async function requestClose() {
  if (!props.asyncClose) {
    close();
    return;
  }
  try {
    closing.value = true;
    await props.asyncClose();
  } finally {
    closing.value = false;
    close();
  }
}

function dismiss() {
  if (!closing.value) void requestClose();
}

useFocusTrap(() => props.open, panel);
useScrollLock(() => props.open);
useEscape(dismiss, () => props.open);
</script>

<template>
  <PixelPortal v-if="open" :container="container">
    <div
      :class="modalLayerClasses"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="$slots.description ? descriptionId : undefined"
    >
      <div aria-hidden="true" data-pxl-overlay-backdrop="" :class="overlayBackdropClasses('fixed')" @click="dismiss" />
      <div ref="panel" :class="classes.panel">
        <div :class="classes.header">
          <h4 :id="titleId" :class="classes.title">{{ locale.upper(title) }}</h4>
          <button
            type="button"
            :aria-label="closeLabel"
            :aria-busy="closing || undefined"
            :disabled="closing"
            :class="classes.closeButton"
            @click="requestClose"
          >
            <span v-if="closing" aria-hidden="true" :class="classes.busy" />
            <PixelGlyph v-else name="close" />
          </button>
        </div>
        <!-- The pixel window's body holds the description too. -->
        <div v-if="surface === 'pixel'" :class="classes.body">
          <p v-if="$slots.description" :id="descriptionId" :class="classes.description"><slot name="description" /></p>
          <slot />
        </div>
        <template v-else>
          <p v-if="$slots.description" :id="descriptionId" :class="classes.description"><slot name="description" /></p>
          <div :class="classes.body"><slot /></div>
        </template>
        <div v-if="$slots.footer" :class="classes.footer"><slot name="footer" /></div>
      </div>
    </div>
  </PixelPortal>
</template>
