<script setup lang="ts" generic="T extends ToggleGroupType = 'single'">
import { computed, provide, ref, type VNode } from 'vue';
import {
  toggleGroupClasses,
  toggleGroupEmptyValue,
  toggleGroupIsPressed,
  toggleGroupKeyMove,
  toggleGroupMoveTarget,
  toggleGroupRole,
  toggleGroupToggle,
  type Surface,
  type ToggleGroupSize,
  type ToggleGroupType,
  type ToggleGroupVariant,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_TOGGLE_GROUP } from './_internal/toggle-group-context.js';

/** The value of a toggle group: a string in single mode (`''` for none), the pressed values in multiple mode. */
export type ToggleGroupValue<T extends ToggleGroupType = ToggleGroupType> = T extends 'multiple' ? string[] : string;

/**
 * A row of `PixelToggle`s sharing one value. In single mode (the default) it
 * is a radiogroup and its toggles are radios — pressing the pressed one
 * unsets it; in multiple mode its toggles are pressed buttons, the row a
 * group when it has a name. Bind the value with `v-model` (a string, or an
 * array in multiple mode), or leave it uncontrolled with `default-value`.
 * With `roving-focus` only one toggle is in the tab order, and the arrow
 * keys, Home and End move between them. Extra attributes and listeners go to
 * the row.
 */
export interface PixelToggleGroupProps<T extends ToggleGroupType = 'single'> {
  /** `single`: one value, a radiogroup of radios; `multiple`: any number of values, pressed buttons. Default `single`. */
  type?: T;
  /** Value (`v-model`); leave unset for an uncontrolled group. */
  modelValue?: ToggleGroupValue<T>;
  /** Initial value while uncontrolled; nothing pressed by default. */
  defaultValue?: ToggleGroupValue<T>;
  /** Only one toggle is in the tab order; the arrow keys, Home and End move between them. */
  rovingFocus?: boolean;
  /** The arrow keys wrap from the last toggle to the first and back. */
  loop?: boolean;
  /** Size of the toggles. */
  size?: ToggleGroupSize;
  /** Variant of the toggles. */
  variant?: ToggleGroupVariant;
  /** Surface of the toggles; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name of the group (`aria-label`). */
  ariaLabel?: string;
  /** Id of the element that names the group (`aria-labelledby`). */
  ariaLabelledby?: string;
}

const props = withDefaults(defineProps<PixelToggleGroupProps<T>>(), {
  type: undefined,
  modelValue: undefined,
  defaultValue: undefined,
  rovingFocus: false,
  loop: false,
  size: 'md',
  variant: 'soft',
  surface: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
});

const emit = defineEmits<{
  /** The new value, after each press. */
  'update:modelValue': [value: ToggleGroupValue<T>];
}>();
defineSlots<{
  /** The `PixelToggle`s. */
  default?(): VNode[];
}>();

const type = computed<ToggleGroupType>(() => props.type ?? 'single');
const surface = useEffectiveSurface(() => props.surface);
const [value, setValue] = useControllableState<string | string[]>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? toggleGroupEmptyValue(type.value),
  onChange: (next) => emit('update:modelValue', next as ToggleGroupValue<T>),
});

const items = new Map<string, HTMLButtonElement>();
let order: string[] = [];
const focusedValue = ref<string | null>(null);

provide(PIXEL_TOGGLE_GROUP, {
  type,
  size: computed(() => props.size),
  variant: computed(() => props.variant),
  surface,
  rovingFocus: computed(() => props.rovingFocus),
  focusedValue,
  isPressed: (item) => toggleGroupIsPressed(type.value, value.value, item),
  toggle: (item) => setValue(toggleGroupToggle(type.value, value.value, item)),
  registerItem(item, element) {
    items.set(item, element);
    if (!order.includes(item)) order.push(item);
    // The first toggle holds the tab stop until the arrow keys move it.
    if (focusedValue.value === null) focusedValue.value = item;
  },
  unregisterItem(item) {
    items.delete(item);
    order = order.filter((other) => other !== item);
    if (focusedValue.value === item) focusedValue.value = order[0] ?? null;
  },
  onItemKeydown(event, item) {
    const move = toggleGroupKeyMove(event.key);
    if (move === undefined) return;
    event.preventDefault();
    const next = toggleGroupMoveTarget(order, item, move, props.loop);
    if (next === undefined) return;
    const element = items.get(next);
    if (!element) return;
    focusedValue.value = next;
    element.focus();
  },
});
</script>

<template>
  <div
    :role="toggleGroupRole(type, !!(ariaLabel || ariaLabelledby))"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :class="toggleGroupClasses"
  >
    <slot />
  </div>
</template>
