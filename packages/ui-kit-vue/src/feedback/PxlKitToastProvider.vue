<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, shallowRef, useTemplateRef, type VNode } from 'vue';
import {
  NO_TOAST_MESSAGES,
  TOAST_DURATION,
  TOAST_HOTKEY,
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  addToast,
  createToastAnnouncer,
  createToastFn,
  isToastHotkey,
  keepToastFocus,
  liveToastMessages,
  removeToast,
  toToastItem,
  toastFocusOrigin,
  toastLiveRegionClasses,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  toastViewportLabel,
  updateToast,
  type Surface,
  type ToastLiveRegions,
  type ToastPosition,
} from '@pxlkit/ui-kit-core';
import type { PxlNode } from '../_internal/render-node.js';
import { useEventListener } from '../composables/event-listener.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';
import PixelToast from './PixelToast.vue';
import { PXLKIT_TOAST, type ToastInput, type ToastItem, type ToastPatch, type UseToastReturn } from './toast-context.js';

/**
 * Holds the toast queue of everything inside it and renders the toasts in a
 * viewport portalled to `document.body`, once mounted (nothing on the
 * server): a `role="region"` landmark named "Notifications (F8)" that the
 * hotkey moves focus to, holding the two live regions — `role="status"` and
 * `role="alert"` — that announce the toasts. When the toast holding focus
 * leaves, focus moves to the next toast, the previous one, or back where it
 * came from. Call `useToast()` in any component inside to push, update and
 * dismiss toasts; the default slot receives the same API.
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
  /**
   * Auto-dismiss delay, in ms, of the toasts that set no `duration` of their
   * own; `0` keeps them until dismissed. A promise's error toast stays at
   * least 6 s, unless this is `0`.
   */
  duration?: number;
  /**
   * Key that moves focus to the toasts, written like `F8` or `alt+t`, or
   * `false` for none; the viewport's accessible name tells it.
   */
  hotkey?: string | false;
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
  duration: TOAST_DURATION,
  hotkey: TOAST_HOTKEY,
  surface: undefined,
  stacked: true,
  stackVisible: TOAST_STACK_VISIBLE,
});
defineSlots<{
  /** The part of the app that shows toasts; receives the toast API, with `toasts` unwrapped. */
  default?(api: Omit<UseToastReturn, 'toasts'> & { toasts: readonly ToastItem[] }): VNode[];
}>();

const toasts = shallowRef<ToastItem[]>([]);
const messages = shallowRef<ToastLiveRegions>(NO_TOAST_MESSAGES);
const announce = createToastAnnouncer((next) => {
  messages.value = next;
});
const viewport = useTemplateRef<HTMLElement>('viewport');
// Where focus entered the viewport from: it goes back there once no toast is left.
let returnTo: HTMLElement | null = null;

// A toast that leaves while it holds focus hands it on once the change has
// rendered.
function change(next: ToastItem[]) {
  const restoreFocus = keepToastFocus(viewport.value, () => returnTo);
  toasts.value = next;
  if (restoreFocus) void nextTick(restoreFocus);
}

function push(input: ToastInput): string {
  const toast = toToastItem(input, props.duration);
  change(addToast(toasts.value, toast, props.max));
  announce(toast);
  return toast.id;
}

function update(id: string, patch: ToastPatch) {
  const previous = toasts.value.find((t) => t.id === id);
  change(updateToast(toasts.value, id, patch));
  const toast = toasts.value.find((t) => t.id === id);
  if (toast) announce(toast, previous);
}

function dismiss(id: string) {
  change(removeToast(toasts.value, id));
}

function clear() {
  change([]);
}

const toast = createToastFn<PxlNode>({ push, update, dismiss }, () => props.duration);
provide(PXLKIT_TOAST, { toast, dismiss, update, clear, toasts: computed(() => toasts.value) });

// Like the React kit's, the viewport renders once mounted: the server and
// hydration render the content alone.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// The hotkey takes focus to the toasts on screen.
useEventListener('keydown', (event) => {
  if (!toasts.value.length || !isToastHotkey(event, props.hotkey)) return;
  event.preventDefault();
  viewport.value?.focus();
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
const live = computed(() => liveToastMessages(messages.value, toasts.value));

function onMouseenter() {
  if (props.stacked) hovered.value = true;
}

function onMouseleave(event: MouseEvent) {
  if (!props.stacked) return;
  hovered.value = false;
  // Removing the focused toast takes focus away, and need not fire a blur.
  focused.value = (event.currentTarget as HTMLElement).contains(document.activeElement);
}

function onFocusin(event: FocusEvent) {
  returnTo = toastFocusOrigin(event.currentTarget as HTMLElement, event.relatedTarget) ?? returnTo;
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
    <!-- The hotkey moves focus to the viewport, from where Tab reaches the toasts' buttons. -->
    <div
      ref="viewport"
      role="region"
      :aria-label="toastViewportLabel(hotkey)"
      tabindex="-1"
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
      <!-- The live regions are on the page before any toast: one inserted with its text already in it is read unreliably. -->
      <div role="status" :class="toastLiveRegionClasses">
        <p v-for="message in live.polite" :key="message.key">{{ message.text }}</p>
      </div>
      <div role="alert" :class="toastLiveRegionClasses">
        <p v-for="message in live.assertive" :key="message.key">{{ message.text }}</p>
      </div>
    </div>
  </PixelPortal>
</template>
