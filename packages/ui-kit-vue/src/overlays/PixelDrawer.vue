<script setup lang="ts">
import { computed, useId, useTemplateRef, warn, watch, type VNode } from 'vue';
import {
  drawerLayerClasses,
  drawerPanelClasses,
  overlayBackdropClasses,
  type DrawerSide,
  type DrawerSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEscape, useFocusTrap, useScrollLock } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/**
 * Modal panel anchored to an edge of the viewport (right, left, top or
 * bottom), with focus trap, scroll lock and Escape / backdrop dismissal.
 * Compose its content from `PixelDrawerHeader`, `PixelDrawerBody` and
 * `PixelDrawerFooter`. Name it with `title` or `aria-label`. Bind it with
 * `v-model:open`.
 *
 * @example
 * <PixelDrawer v-model:open="open" title="Settings">
 *   <PixelDrawerHeader>Settings</PixelDrawerHeader>
 *   <PixelDrawerBody>…</PixelDrawerBody>
 *   <PixelDrawerFooter><PixelButton @click="open = false">Done</PixelButton></PixelDrawerFooter>
 * </PixelDrawer>
 */
export interface PixelDrawerProps {
  /** Whether the drawer is visible (`v-model:open`). */
  open: boolean;
  /** Edge of the viewport the drawer is anchored to. */
  side?: DrawerSide;
  /** Width (left / right) or height (top / bottom) preset. */
  size?: DrawerSize;
  /** Dim the page behind the drawer. */
  overlay?: boolean;
  /** Close when the backdrop is clicked. */
  dismissOnOverlay?: boolean;
  /** Keep Tab focus inside the drawer while it is open. */
  trapFocus?: boolean;
  /** Accessible name of the dialog (visually hidden). */
  title?: string;
  /** Accessible description of the dialog (visually hidden). */
  description?: string;
  /**
   * Accessible name when there is no `title` — every dialog needs one
   * (WCAG 4.1.2).
   */
  ariaLabel?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Portal target; `document.body` when left out. */
  container?: HTMLElement | null;
}

const props = withDefaults(defineProps<PixelDrawerProps>(), {
  side: 'right',
  size: 'md',
  overlay: true,
  dismissOnOverlay: true,
  trapFocus: true,
  title: undefined,
  description: undefined,
  ariaLabel: undefined,
  surface: undefined,
  container: undefined,
});
const emit = defineEmits<{
  /** `false` when the drawer asks to close (Escape, backdrop), for `v-model:open`. */
  'update:open': [open: boolean];
}>();
defineSlots<{
  /** The drawer content — typically header, body and footer parts. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const titleId = useId();
const descriptionId = useId();
const panel = useTemplateRef<HTMLElement>('panel');
const panelClasses = computed(() => drawerPanelClasses(surface.value, props.side, props.size));
const backdropClasses = overlayBackdropClasses('absolute');

const close = () => emit('update:open', false);

function onBackdropClick() {
  if (props.dismissOnOverlay) close();
}

useFocusTrap(() => props.open && props.trapFocus, panel);
useScrollLock(() => props.open);
useEscape(close, () => props.open);

watch(
  () => props.open && !props.title && !props.ariaLabel,
  (unnamed) => {
    if (unnamed) warn('[PixelDrawer] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
  },
  { immediate: true },
);

defineExpose({
  /** The drawer panel while it is open. */
  element: panel,
});
</script>

<template>
  <PixelPortal v-if="open" :container="container">
    <div :class="drawerLayerClasses">
      <div
        v-if="overlay"
        aria-hidden="true"
        data-pxl-overlay-backdrop=""
        data-pxl-drawer-overlay=""
        :class="backdropClasses"
        @click="onBackdropClick"
      />
      <div
        ref="panel"
        data-pxl-drawer-panel="true"
        role="dialog"
        aria-modal="true"
        :aria-label="title ? undefined : ariaLabel"
        :aria-labelledby="title ? titleId : undefined"
        :aria-describedby="description ? descriptionId : undefined"
        :class="panelClasses"
      >
        <div v-if="title || description" class="sr-only">
          <span v-if="title" :id="titleId">{{ title }}</span>
          <span v-if="description" :id="descriptionId">{{ description }}</span>
        </div>
        <slot />
      </div>
    </div>
  </PixelPortal>
</template>
