<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { formLabelClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { useFormItem } from './_internal/form-context.js';

/** The `<label>` of a `PixelFormItem`, pointing at its control. Attributes go to the `<label>`. */
export interface PixelFormLabelProps {
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelFormLabelProps>(), { surface: undefined });

defineSlots<{
  /** The label text. */
  default?(): VNode[];
}>();

const item = useFormItem('PixelFormLabel');
const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => formLabelClasses(surface.value));
</script>

<template>
  <label :for="item.id" :class="classes"><slot /></label>
</template>
