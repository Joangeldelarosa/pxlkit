<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, type VNode } from 'vue';
import { toggleClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { useToggleGroupContext } from './_internal/toggle-group-context.js';

/**
 * Two-state toggle `<button>` with `aria-pressed`. Standalone, bind its state
 * with `v-model:pressed` or leave it uncontrolled (starting unpressed). Inside
 * a `PixelToggleGroup` the group owns the state and the toggle takes on its
 * size, variant and surface — a radio of a single-select group, with roving
 * focus when the group asks for it. Extra attributes and listeners go to the
 * `<button>`.
 */
export interface PixelToggleProps {
  /** Identifies the toggle within its group; also exposed as `data-pxl-toggle-value`. */
  value: string;
  /** Pressed state of a standalone toggle (`v-model:pressed`); leave unset for an uncontrolled one. */
  pressed?: boolean;
  /** Surface override; defaults to the group's, then to the nearest provider. */
  surface?: Surface;
  /** Native `disabled`. */
  disabled?: boolean;
}

const props = withDefaults(defineProps<PixelToggleProps>(), {
  pressed: undefined,
  surface: undefined,
  disabled: false,
});

const emit = defineEmits<{
  /** The new pressed state of a standalone toggle, after each press. */
  'update:pressed': [pressed: boolean];
}>();
defineSlots<{ default?(): VNode[] }>();

const group = useToggleGroupContext();
const surface = useEffectiveSurface(() => props.surface ?? group?.surface.value);
const button = useTemplateRef<HTMLButtonElement>('button');
const [standalonePressed, setPressed] = useControllableState({
  value: () => props.pressed,
  defaultValue: () => false,
  onChange: (next) => emit('update:pressed', next),
});

const isPressed = computed(() => (group ? group.isPressed(props.value) : standalonePressed.value));
// A single-select group is a radiogroup: its toggles announce "one of N".
const radio = computed(() => group?.type.value === 'single');
const tabindex = computed(() => {
  if (!group?.rovingFocus.value) return undefined;
  return group.focusedValue.value === props.value ? 0 : -1;
});
const classes = computed(() =>
  toggleClasses(surface.value, {
    pressed: isPressed.value,
    size: group?.size.value ?? 'md',
    variant: group?.variant.value ?? 'soft',
  }),
);

onMounted(() => group?.registerItem(props.value, button.value!));
onBeforeUnmount(() => group?.unregisterItem(props.value));

function onClick() {
  if (props.disabled) return;
  if (group) group.toggle(props.value);
  else setPressed(!isPressed.value);
}

function onKeydown(event: KeyboardEvent) {
  group?.onItemKeydown(event, props.value);
}
</script>

<template>
  <button
    ref="button"
    type="button"
    :role="radio ? 'radio' : undefined"
    :aria-checked="radio ? isPressed : undefined"
    :aria-pressed="radio ? undefined : isPressed"
    :data-state="isPressed ? 'on' : 'off'"
    :data-pxl-toggle-value="value"
    :disabled="disabled"
    :tabindex="tabindex"
    :class="classes"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
