<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { formDescriptionClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { useFormItem } from './_internal/form-context.js';

/** The description of a `PixelFormItem`, which its control is described by. Attributes go to the `<p>`. */
export interface PixelFormDescriptionProps {
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelFormDescriptionProps>(), { surface: undefined });

defineSlots<{
  /** The description text. */
  default?(): VNode[];
}>();

const item = useFormItem('PixelFormDescription');
const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => formDescriptionClasses(surface.value));
</script>

<template>
  <p :id="item.descriptionId" :class="classes"><slot /></p>
</template>
