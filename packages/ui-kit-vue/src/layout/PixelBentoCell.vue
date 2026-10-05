<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  bentoCellClasses,
  type BentoKind,
  type BentoSpan,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** One cell of a `PixelBento`: its span, inner layout and optional tone chrome. */
export interface PixelBentoCellProps {
  /** Columns × rows the cell spans. */
  span?: BentoSpan;
  /** Inner layout of the cell. */
  variant?: BentoKind;
  /** @deprecated Use `variant`. */
  kind?: BentoKind;
  /** Tone of the chrome. */
  tone?: ToneKey;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border, radius and tone tint. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelBentoCellProps>(), {
  span: '1x1',
  variant: undefined,
  kind: undefined,
  tone: 'neutral',
  surface: undefined,
  bordered: false,
});
defineSlots<{
  /** Cell content. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const kind = computed<BentoKind>(() => props.variant ?? props.kind ?? 'feature');
const classes = computed(() =>
  bentoCellClasses(surface.value, { span: props.span, kind: kind.value, tone: props.tone, bordered: props.bordered }),
);
</script>

<template>
  <div :data-kind="kind" :data-span="span" :class="classes"><slot /></div>
</template>
