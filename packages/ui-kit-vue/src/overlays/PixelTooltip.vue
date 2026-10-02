<script setup lang="ts">
import { computed, onScopeDispose, shallowRef, useId, useTemplateRef, watch, type VNode } from 'vue';
import {
  TOOLTIP_Z_INDEX,
  anchorFloating,
  anchoredMiddleware,
  describeTooltipTrigger,
  floatingStyles,
  resolveTooltipDelays,
  tooltipClasses,
  tooltipTriggerClasses,
  type Surface,
  type TooltipDelay,
  type TooltipPosition,
  type TooltipTrigger,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEventListener } from '../composables/event-listener.js';
import { useEscape } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/**
 * Floating hint anchored to the element in the default slot, rendered into
 * `<body>` and kept in view (it flips and shifts away from the edges). It
 * opens on hover and focus, on focus only, or on click, and describes the
 * trigger (`aria-describedby`) while open. Escape closes any tooltip — one
 * that opens on hover or focus stays closed until the pointer or focus has
 * left the trigger — and a click tooltip also closes on a press outside.
 * Bind `v-model:open` to control it, or leave it uncontrolled with
 * `default-open`.
 *
 * @example
 * <PixelTooltip label="Save your changes" :delay="{ open: 0 }">
 *   <PixelButton>Save</PixelButton>
 * </PixelTooltip>
 */
export interface PixelTooltipProps {
  /** Text of the tooltip; the `content` slot takes richer content. */
  label?: string;
  /** Preferred side of the trigger; the tooltip flips and shifts to stay in view. */
  position?: TooltipPosition;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /**
   * Open / close delays in ms (default `{ open: 200, close: 100 }`); a bare
   * number is the open delay.
   */
  delay?: TooltipDelay;
  /** Whether the tooltip is open (`v-model:open`); leave unset for an uncontrolled tooltip. */
  open?: boolean;
  /** Initial open state while uncontrolled. */
  defaultOpen?: boolean;
  /** What opens it: `hover` (and focus), `focus` only, or `click` to toggle. */
  trigger?: TooltipTrigger;
  /** Gap between the trigger and the tooltip, in px. */
  sideOffset?: number;
}

const props = withDefaults(defineProps<PixelTooltipProps>(), {
  label: undefined,
  position: 'top',
  surface: undefined,
  delay: undefined,
  open: undefined,
  defaultOpen: false,
  trigger: 'hover',
  sideOffset: 8,
});
const emit = defineEmits<{
  /** Every open state the tooltip asks for, for `v-model:open`. */
  'update:open': [open: boolean];
}>();
defineSlots<{
  /** The trigger the tooltip is anchored to — an interactive element for click tooltips. */
  default?(): VNode[];
  /** Tooltip content, in place of `label`. */
  content?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const tipId = useId();
const wrapper = useTemplateRef<HTMLElement>('wrapper');
const tip = useTemplateRef<HTMLElement>('tip');
const position = shallowRef({ x: 0, y: 0 });
const [isOpen, setOpen] = useControllableState({
  value: () => props.open,
  defaultValue: () => props.defaultOpen,
  onChange: (next) => emit('update:open', next),
});

const classes = computed(() => tooltipClasses(surface.value, props.trigger));
const style = computed(() => [floatingStyles(tip.value, position.value.x, position.value.y), { zIndex: TOOLTIP_Z_INDEX }]);

// Keep the tooltip anchored to the trigger while it is on the page.
watch(
  [wrapper, tip, () => props.position, () => props.sideOffset],
  ([reference, floating, placement, sideOffset], _previous, onCleanup) => {
    if (!reference || !floating) return;
    onCleanup(
      anchorFloating(reference, floating, { placement, middleware: anchoredMiddleware(sideOffset) }, ({ x, y }) => {
        position.value = { x, y };
      }),
    );
  },
);

// While shown, the tooltip describes the element that takes focus — the
// first focusable one inside the wrapper, else the wrapper itself.
watch([wrapper, tip], ([reference, floating], _previous, onCleanup) => {
  if (reference && floating) onCleanup(describeTooltipTrigger(reference, tipId));
});

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
// Set when Escape dismisses the tooltip: hover and focus leave it closed
// until the pointer or focus has left the trigger.
let dismissed = false;

function clearTimers() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
  openTimer = closeTimer = undefined;
}

function schedule(open: boolean) {
  clearTimers();
  const delays = resolveTooltipDelays(props.delay);
  const wait = open ? delays.open : delays.close;
  if (wait <= 0) {
    setOpen(open);
    return;
  }
  const timer = setTimeout(() => {
    openTimer = closeTimer = undefined;
    setOpen(open);
  }, wait);
  if (open) openTimer = timer;
  else closeTimer = timer;
}

onScopeDispose(clearTimers);

function enter() {
  if (!dismissed) schedule(true);
}

function leave() {
  dismissed = false;
  schedule(false);
}

function onHover(entered: boolean) {
  if (props.trigger !== 'hover') return;
  if (entered) enter();
  else leave();
}

function onFocusChange(focused: boolean) {
  if (props.trigger === 'click') return;
  if (focused) enter();
  else leave();
}

// The wrapper stays non-interactive: clicks bubble up from the trigger, whose
// own keyboard activation (a button's Enter / Space) then toggles too.
function onClick() {
  if (props.trigger !== 'click') return;
  clearTimers();
  setOpen(!isOpen.value);
}

// Escape dismisses the tooltip in every mode (WCAG 1.4.13), a pending open
// included.
useEscape(
  () => {
    clearTimers();
    if (props.trigger !== 'click') dismissed = true;
    if (isOpen.value) setOpen(false);
  },
  () => isOpen.value || openTimer !== undefined,
);

// A click tooltip also closes on a press outside it.
useEventListener(
  'pointerdown',
  (event) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (wrapper.value?.contains(target) || tip.value?.contains(target)) return;
    setOpen(false);
  },
  () => (props.trigger === 'click' && isOpen.value && typeof document !== 'undefined' ? document : null),
);

defineExpose({
  /** The wrapper around the trigger. */
  element: wrapper,
});
</script>

<template>
  <span
    ref="wrapper"
    :class="tooltipTriggerClasses"
    @mouseenter="onHover(true)"
    @mouseleave="onHover(false)"
    @focusin="onFocusChange(true)"
    @focusout="onFocusChange(false)"
    @click="onClick"
  >
    <slot />
  </span>
  <PixelPortal v-if="isOpen && ($slots.content || label != null)">
    <span ref="tip" :id="tipId" role="tooltip" :style="style" :class="classes">
      <slot name="content">{{ label }}</slot>
    </span>
  </PixelPortal>
</template>
