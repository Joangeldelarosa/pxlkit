<script setup lang="ts">
import type { VNode } from 'vue';
import { dropdownHeaderClasses } from '@pxlkit/ui-kit-core';

/** A label over a group of items; not an item itself (`role="presentation"`). */
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <div role="presentation" data-testid="dropdown-header" :class="dropdownHeaderClasses"><slot /></div>
</template>
