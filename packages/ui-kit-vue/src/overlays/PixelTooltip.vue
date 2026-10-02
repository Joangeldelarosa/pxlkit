<script setup lang="ts">
import { computed, onScopeDispose, shallowRef, useId, useTemplateRef, watch, type VNode } from 'vue';
import {
  TOOLTIP_Z_INDEX,
  anchorFloating,
  anchoredMiddleware,
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
 * opens on hover and focus, on focus only, or on click — a click tooltip
 * closes on Escape and on a press outside. Bind `v-model:open` to control
 * it, or leave it uncontrolled with `default-open`.
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

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

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
  const timer = setTimeout(() => setOpen(open), wait);
  if (open) openTimer = timer;
  else closeTimer = timer;
}

onScopeDispose(clearTimers);

function onHover(entered: boolean) {
  if (props.trigger === 'hover') schedule(entered);
}

function onFocusChange(focused: boolean) {
  if (props.trigger !== 'click') schedule(focused);
}

// The wrapper stays non-interactive: clicks bubble up from the trigger, whose
// own keyboard activation (a button's Enter / Space) then toggles too.
function onClick() {
  if (props.trigger !== 'click') return;
  clearTimers();
  setOpen(!isOpen.value);
}

// A click tooltip needs explicit dismissal: a press outside or Escape.
const clickOpen = () => props.trigger === 'click' && isOpen.value;
useEventListener(
  'pointerdown',
  (event) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (wrapper.value?.contains(target) || tip.value?.contains(target)) return;
    setOpen(false);
  },
  () => (clickOpen() && typeof document !== 'undefined' ? document : null),
);
useEscape(() => setOpen(false), clickOpen);

defineExpose({
  /** The wrapper around the trigger. */
  element: wrapper,
});
</script>

<template>
  <span
    ref="wrapper"
    :class="tooltipTriggerClasses"
    :aria-describedby="isOpen ? tipId : undefined"
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
