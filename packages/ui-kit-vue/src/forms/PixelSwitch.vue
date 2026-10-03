<script setup lang="ts">
import { computed } from 'vue';
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Toggle switch (`role="switch"`) with a label, tones and surfaces. Bind its
 * state with `v-model:checked`, or leave it uncontrolled with
 * `default-checked`. With a `name` it submits `value` in forms while on.
 * Extra attributes and listeners go to the switch `<button>`.
 */
export interface PixelSwitchProps {
  /** Label rendered next to the switch. */
  label: string;
  /** Checked state (`v-model:checked`); leave unset for an uncontrolled switch. */
  checked?: boolean;
  /** Initial checked state while uncontrolled. */
  defaultChecked?: boolean;
  /** Disables interaction and greys out the control. */
  disabled?: boolean;
  /** Tone of the "on" state. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits `value` while on. */
  name?: string;
  /** Form value while on. */
  value?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** `id` of the switch button. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelSwitchProps>(), {
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  tone: 'green',
  surface: undefined,
  name: undefined,
  value: 'on',
  required: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The new checked state, after each toggle. */
  'update:checked': [checked: boolean];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [isChecked, setChecked] = useControllableState({
  value: () => props.checked,
  defaultValue: () => props.defaultChecked,
  onChange: (next) => emit('update:checked', next),
});

function toggle() {
  if (!props.disabled) setChecked(!isChecked.value);
}

const classes = computed(() => {
  const s = surfaceClasses(surface.value);
  const t = toneMap[props.tone];
  const pixel = surface.value === 'pixel';
  return {
    button: cn(
      'group inline-flex items-center gap-3 text-sm text-retro-text focus-visible:outline-hidden',
      s.font,
      focusRing,
      t.ring,
      props.disabled && 'opacity-50 cursor-not-allowed',
    ),
    track: cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center transition-colors',
      s.border,
      pixel ? 'rounded-[3px]' : 'rounded-full',
      isChecked.value ? cn(t.border, t.bg) : 'border-retro-border-strong bg-retro-surface',
    ),
    thumb: cn(
      'absolute left-0.5 h-4 w-4 transition-transform',
      pixel ? 'rounded-[2px]' : 'rounded-full',
      isChecked.value ? cn('translate-x-5', t.fill) : 'translate-x-0 bg-retro-muted',
    ),
  };
});
</script>

<template>
  <input v-if="name && isChecked" type="hidden" :name="name" :value="value" :required="required" />
  <button
    v-bind="$attrs"
    :id="id"
    type="button"
    role="switch"
    :aria-checked="isChecked"
    :aria-disabled="disabled"
    :aria-required="required || undefined"
    :disabled="disabled"
    :class="classes.button"
    @click="toggle"
  >
    <span :class="classes.track"><span :class="classes.thumb" /></span>
    <span class="select-none">{{ label }}</span>
  </button>
</template>
