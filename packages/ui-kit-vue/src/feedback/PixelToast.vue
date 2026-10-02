<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch, watchEffect } from 'vue';
import {
  TOAST_DISMISS_LABEL,
  createToastCountdown,
  holdToastCountdown,
  isAssertiveToast,
  resetToastCountdown,
  startToastCountdown,
  toastClasses,
  toastCountdownDelay,
  toastCountdownStyle,
  toastDuration,
  toastLeading,
  toastTone,
  type Surface,
  type ToastHolds,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { RenderNode } from '../_internal/render-node.js';
import { useEffectiveSurface } from '../composables/surface.js';
import type { ToastItem } from './toast-context.js';

/**
 * One toast card: title in the tone colour, optional message, leading icon
 * (a spinner while loading) and action, a dismiss button and the countdown
 * bar of its auto-dismiss, which holds still while the card is hovered or
 * focused. It announces itself with `role="status"` (polite), or
 * `role="alert"` (assertive) for critical tones and `assertive` toasts.
 * Usually rendered by `PxlKitToastProvider` through `useToast()`; use it
 * directly for custom rendering.
 *
 * @example
 * <PixelToast :toast="{ id: 'saved', title: 'Saved', tone: 'green' }" @dismiss="saved = false" />
 */
export interface PixelToastProps {
  /** The toast to show. */
  toast: ToastItem;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelToastProps>(), { surface: undefined });
const emit = defineEmits<{
  /** The dismiss button was pressed, or the countdown ran out. */
  dismiss: [];
}>();

const surface = useEffectiveSurface(() => props.surface);
const tone = computed(() => toastTone(props.toast));
const classes = computed(() => toastClasses(surface.value, tone.value));
const assertive = computed(() => isAssertiveToast(props.toast));
const leading = computed(() => toastLeading(props.toast));
const duration = computed(() => toastDuration(props.toast));

const countdown = shallowRef(createToastCountdown(duration.value));
const bar = useTemplateRef<HTMLElement>('bar');

// Count down afresh when the toast changes its duration (a promise toast
// settling flips it from 0 to 4500).
watch(duration, (next) => {
  countdown.value = resetToastCountdown(countdown.value, next);
});

// Start once the full bar is on the page: reading its width commits that
// style first, so the bar shrinks from full rather than starting empty.
watchEffect(
  () => {
    if (countdown.value.startedAt !== null) return;
    void bar.value?.offsetWidth;
    countdown.value = startToastCountdown(countdown.value, Date.now());
  },
  { flush: 'post' },
);

watch(countdown, (state, _previous, onCleanup) => {
  const delay = toastCountdownDelay(state, Date.now());
  if (delay === null) return;
  const timer = setTimeout(() => emit('dismiss'), delay);
  onCleanup(() => clearTimeout(timer));
});

// The pointer over the card or focus inside it holds the countdown, until
// both have left. Focus is re-read when the pointer leaves: a focused
// element removed from the page takes focus away and need not fire a blur.
function hold(holds: Partial<ToastHolds>) {
  countdown.value = holdToastCountdown(countdown.value, holds, Date.now());
}

function onMouseleave(event: MouseEvent) {
  hold({ hover: false, focus: (event.currentTarget as HTMLElement).contains(document.activeElement) });
}

function onFocusout(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) hold({ focus: false });
}
</script>

<template>
  <div
    :role="assertive ? 'alert' : 'status'"
    :aria-live="assertive ? 'assertive' : 'polite'"
    aria-atomic="true"
    data-pxl-toast="true"
    :data-tone="tone"
    :data-loading="toast.loading ? 'true' : 'false'"
    :class="classes.root"
    @mouseenter="hold({ hover: true })"
    @mouseleave="onMouseleave"
    @focusin="hold({ focus: true })"
    @focusout="onFocusout"
  >
    <div :class="classes.row">
      <span v-if="surface === 'pixel'" aria-hidden="true" :class="classes.stripe" />
      <span v-if="leading" data-pxl-toast-leading="true" :class="classes.leading" aria-hidden="true">
        <span v-if="leading.kind === 'spinner'" role="presentation" aria-hidden="true" :class="classes.spinner" />
        <RenderNode v-else :node="leading.node" />
      </span>
      <div :class="classes.body">
        <p :class="classes.title">{{ toast.title }}</p>
        <p v-if="toast.message" :class="classes.message">{{ toast.message }}</p>
        <div v-if="toast.action" :class="classes.action"><RenderNode :node="toast.action" /></div>
      </div>
      <button type="button" :aria-label="TOAST_DISMISS_LABEL" :class="classes.dismiss" @click="emit('dismiss')">
        <PixelGlyph name="close" />
      </button>
    </div>
    <div v-if="countdown.duration > 0" :class="classes.track" aria-hidden="true">
      <div ref="bar" :class="classes.bar" :style="toastCountdownStyle(countdown)" />
    </div>
  </div>
</template>
