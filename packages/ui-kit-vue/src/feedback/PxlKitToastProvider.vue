<script setup lang="ts">
import { computed, onMounted, provide, ref, shallowRef, type VNode } from 'vue';
import {
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  TOAST_VIEWPORT_LABEL,
  addToast,
  createToastFn,
  removeToast,
  toToastItem,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  updateToast,
  type Surface,
  type ToastPosition,
} from '@pxlkit/ui-kit-core';
import type { PxlNode } from '../_internal/render-node.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';
import PixelToast from './PixelToast.vue';
import { PXLKIT_TOAST, type ToastInput, type ToastItem, type ToastPatch, type UseToastReturn } from './toast-context.js';

/**
 * Holds the toast queue of everything inside it and renders the toasts in a
 * viewport portalled to `document.body`: a `role="region"` landmark named
 * "Notifications", rendered once mounted (nothing on the server). Call
 * `useToast()` in any component inside to push, update and dismiss toasts;
 * the default slot receives the same API.
 *
 * @example
 * <PxlKitToastProvider position="bottom-right">
 *   <App />
 * </PxlKitToastProvider>
 *
 * // In a component inside:
 * const { toast } = useToast();
 * toast.success('Saved', 'Your changes were persisted.');
 */
export interface PxlKitToastProviderProps {
  /** Corner, or edge centre, of the screen the toasts appear at. */
  position?: ToastPosition;
  /** Maximum simultaneous toasts. Oldest is dropped if exceeded. */
  max?: number;
  /** Surface of the toasts; defaults to the nearest provider. */
  surface?: Surface;
  /**
   * Sonner-style stacked-offset visual: toasts collapse into a small stack
   * showing only the front card; hovering or focusing it expands it into a
   * vertical list.
   */
  stacked?: boolean;
  /** How many additional cards peek behind the front when stacked. */
  stackVisible?: number;
}

const props = withDefaults(defineProps<PxlKitToastProviderProps>(), {
  position: 'top-right',
  max: TOAST_MAX,
  surface: undefined,
  stacked: true,
  stackVisible: TOAST_STACK_VISIBLE,
});
defineSlots<{
  /** The part of the app that shows toasts; receives the toast API, with `toasts` unwrapped. */
  default?(api: Omit<UseToastReturn, 'toasts'> & { toasts: readonly ToastItem[] }): VNode[];
}>();

const toasts = shallowRef<ToastItem[]>([]);

function push(input: ToastInput): string {
  const toast = toToastItem(input);
  toasts.value = addToast(toasts.value, toast, props.max);
  return toast.id;
}

function update(id: string, patch: ToastPatch) {
  toasts.value = updateToast(toasts.value, id, patch);
}

function dismiss(id: string) {
  toasts.value = removeToast(toasts.value, id);
}

function clear() {
  toasts.value = [];
}

const toast = createToastFn<PxlNode>({ push, update, dismiss });
provide(PXLKIT_TOAST, { toast, dismiss, update, clear, toasts: computed(() => toasts.value) });

// Like the React kit's, the viewport renders once mounted: the server and
// hydration render the content alone.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// Hovered or focused, a stack opens into a list — and stays open until both
// the pointer and focus have left.
const hovered = ref(false);
const focused = ref(false);
const expanded = computed(() => hovered.value || focused.value);
const slots = computed(() =>
  toastSlots(toasts.value, {
    position: props.position,
    stacked: props.stacked,
    expanded: expanded.value,
    stackVisible: props.stackVisible,
  }),
);

function onMouseenter() {
  if (props.stacked) hovered.value = true;
}

function onMouseleave(event: MouseEvent) {
  if (!props.stacked) return;
  hovered.value = false;
  // Removing the focused toast takes focus away, and need not fire a blur.
  focused.value = (event.currentTarget as HTMLElement).contains(document.activeElement);
}

function onFocusin() {
  if (props.stacked) focused.value = true;
}

function onFocusout(event: FocusEvent) {
  // Only collapse when focus leaves the viewport entirely.
  if (props.stacked && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
    focused.value = false;
  }
}
</script>

<template>
  <slot :toast="toast" :dismiss="dismiss" :update="update" :clear="clear" :toasts="toasts" />
  <PixelPortal v-if="mounted">
    <!-- Each toast is its own live region: the viewport is a landmark only, so nothing is announced twice. -->
    <div
      role="region"
      :aria-label="TOAST_VIEWPORT_LABEL"
      data-pxl-toast-viewport="true"
      :data-expanded="expanded ? 'true' : 'false'"
      :data-stacked="stacked ? 'true' : 'false'"
      :class="toastViewportClasses(position)"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
      @focusin="onFocusin"
      @focusout="onFocusout"
    >
      <div
        v-for="slot in slots"
        :key="slot.toast.id"
        data-pxl-toast-slot="true"
        :data-depth="slot.depth"
        :style="slot.style"
        :class="toastSlotClasses"
      >
        <PixelToast :toast="slot.toast" :surface="surface" @dismiss="dismiss(slot.toast.id)" />
      </div>
    </div>
  </PixelPortal>
</template>
