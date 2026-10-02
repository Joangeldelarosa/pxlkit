<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { alertClasses, alertLive, type AlertLive, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Inline status banner with a label, a message, a tone and an optional icon
 * and action. It announces itself (`role="alert"`): assertively for critical
 * tones (red, gold) and politely for the others, unless `live` says
 * otherwise. The pixel surface adds a left accent stripe.
 *
 * @example
 * <PixelAlert tone="red" label="Connection lost" message="Check your network and retry.">
 *   <template #action><PixelButton size="sm" tone="red" variant="outline">Retry</PixelButton></template>
 * </PixelAlert>
 */
export interface PixelAlertProps {
  /** Short label shown in the tone colour (canonical name for the title). */
  label?: string;
  /** @deprecated Use `label` instead. Retained as alias for one minor. */
  title?: string;
  /** Body message under the label. */
  message: string;
  /** Tone of the border, fill and texts. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** `aria-live` override. Status banners ("info") should usually use `"polite"`. */
  live?: AlertLive;
}

const props = withDefaults(defineProps<PixelAlertProps>(), {
  label: undefined,
  title: undefined,
  tone: 'red',
  surface: undefined,
  live: undefined,
});
defineSlots<{
  /** Leading icon, in the tone colour. */
  icon?(): VNode[];
  /** Action under the message (Retry, Dismiss, …). */
  action?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => alertClasses(surface.value, props.tone));
</script>

<template>
  <div role="alert" :aria-live="alertLive(tone, live)" :class="classes.root">
    <span v-if="surface === 'pixel'" aria-hidden="true" :class="classes.stripe" />
    <div :class="classes.row">
      <span v-if="$slots.icon" :class="classes.icon"><slot name="icon" /></span>
      <div :class="classes.body">
        <p :class="classes.label">{{ label ?? title ?? '' }}</p>
        <p :class="classes.message">{{ message }}</p>
        <div v-if="$slots.action" :class="classes.action"><slot name="action" /></div>
      </div>
    </div>
  </div>
</template>
