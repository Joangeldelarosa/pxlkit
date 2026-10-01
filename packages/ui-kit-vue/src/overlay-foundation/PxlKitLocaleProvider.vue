<script setup lang="ts">
import { computed, provide, type VNode } from 'vue';
import { createLocaleContextValue, type PxlKitLocale } from '@pxlkit/ui-kit-core';
import { PXLKIT_LOCALE } from '../composables/locale.js';

/**
 * Locale-aware text handling for every Pxlkit component inside:
 *
 * 1. Sets `lang` on a wrapper (`display: contents`, so it does not affect
 *    layout), which makes CSS `text-transform: uppercase` handle the Turkish
 *    `i → İ` correctly.
 * 2. Provides `usePxlKitLocale()`: locale-aware `upper()` / `lower()` and the
 *    Google Fonts URL with the subsets the locale needs (`fontsUrl`).
 *
 * For server-rendered apps, also set `lang` on `<html>`.
 */
const props = withDefaults(defineProps<{ locale?: PxlKitLocale }>(), { locale: 'en' });
defineSlots<{ default?(): VNode[] }>();

provide(
  PXLKIT_LOCALE,
  computed(() => createLocaleContextValue(props.locale)),
);
</script>

<template>
  <div :lang="locale" style="display: contents">
    <slot />
  </div>
</template>
