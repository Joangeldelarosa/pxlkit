<script setup lang="ts">
import { computed, provide, shallowRef, watch, type VNode } from 'vue';
import {
  anchorFloating,
  anchoredMiddleware,
  floatingStyles,
  returnFocusOnRemoval,
  toPlacement,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEventListener } from '../composables/event-listener.js';
import { useEscape } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import {
  PIXEL_POPOVER,
  refElement,
  type PopoverAlign,
  type PopoverHasPopup,
  type PopoverRole,
  type PopoverSide,
} from './_internal/popover-context.js';

/**
 * Controlled floating panel anchored to a trigger. Compose
 * `PixelPopoverTrigger` (wrapping one element), `PixelPopoverContent` and
 * optionally `PixelPopoverArrow`; bind the open state with `v-model:open`.
 * Escape and a press outside close it, and content that closes while it
 * holds focus hands focus back to the trigger. Renders no element of its own.
 *
 * @example
 * <PixelPopover v-model:open="open">
 *   <PixelPopoverTrigger><button type="button">Details</button></PixelPopoverTrigger>
 *   <PixelPopoverContent aria-labelledby="details-title">…</PixelPopoverContent>
 * </PixelPopover>
 */
export interface PixelPopoverProps {
  /** Whether the popover is open (`v-model:open`). */
  open: boolean;
  /** Side of the trigger the content opens on; flips when there is no room. */
  side?: PopoverSide;
  /** Alignment of the content along that side. */
  align?: PopoverAlign;
  /** Gap between trigger and content, in px. */
  sideOffset?: number;
  /** Close when Escape is pressed. */
  closeOnEscape?: boolean;
  /** Close on a press outside the trigger and the content. */
  closeOnOutsideClick?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /**
   * `aria-haspopup` advertised on the trigger: `listbox` for combobox
   * patterns, `menu` for menus. A value set on the trigger element wins.
   */
  haspopup?: PopoverHasPopup;
  /**
   * Role of the content. Set `none` when an inner widget owns the semantics
   * (e.g. a listbox inside a combobox).
   */
  role?: PopoverRole;
}

const props = withDefaults(defineProps<PixelPopoverProps>(), {
  side: 'bottom',
  align: 'center',
  sideOffset: 8,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  surface: undefined,
  haspopup: 'dialog',
  role: 'dialog',
});
const emit = defineEmits<{
  /** The requested open state. */
  'update:open': [open: boolean];
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const trigger = shallowRef<HTMLElement | null>(null);
const content = shallowRef<HTMLElement | null>(null);
const position = shallowRef({ x: 0, y: 0 });
// True while a press outside is closing the popover: focus then follows the
// pointer instead of returning to the trigger.
let pressOutside = false;

const setOpen = (next: boolean) => emit('update:open', next);

// Keep the content anchored to the trigger while both are on the page.
watch(
  [trigger, content, () => toPlacement(props.side, props.align), () => props.sideOffset],
  ([reference, floating, placement, sideOffset], _previous, onCleanup) => {
    if (!reference || !floating) return;
    onCleanup(
      anchorFloating(reference, floating, { placement, middleware: anchoredMiddleware(sideOffset) }, ({ x, y }) => {
        position.value = { x, y };
      }),
    );
  },
);

useEscape(
  () => {
    if (props.open) setOpen(false);
  },
  () => props.open && props.closeOnEscape,
);

// The trigger sits outside the teleported content, so both are excluded —
// otherwise a trigger press would close the popover and its click reopen it.
const activeDocument = (active: boolean) => (active && typeof document !== 'undefined' ? document : null);
useEventListener(
  'pointerdown',
  (event) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (content.value?.contains(target)) return;
    if (trigger.value?.contains(target)) return;
    pressOutside = true;
    setOpen(false);
  },
  () => activeDocument(props.open && props.closeOnOutsideClick),
);

// A press outside that did not close the popover (the parent kept it open)
// ends with the pointer release; a new open starts clean.
const releasePress = () => {
  pressOutside = false;
};
useEventListener('pointerup', releasePress, () => activeDocument(props.open));
useEventListener('pointercancel', releasePress, () => activeDocument(props.open));
watch(
  () => props.open,
  (open) => {
    if (open) pressOutside = false;
  },
);

provide(PIXEL_POPOVER, {
  open: computed(() => props.open),
  setOpen,
  side: computed(() => props.side),
  surface,
  haspopup: computed(() => props.haspopup),
  role: computed(() => props.role),
  floatingStyles: computed(() => floatingStyles(content.value, position.value.x, position.value.y)),
  setTrigger(target) {
    trigger.value = refElement(target);
  },
  setContent(target) {
    const element = refElement(target);
    // Called with null right before the content leaves the page.
    if (!element && content.value && !pressOutside) {
      returnFocusOnRemoval(content.value, () => trigger.value);
    }
    content.value = element;
  },
});
</script>

<template>
  <slot />
</template>
