<script setup lang="ts">
import { h } from 'vue';
import { PixelTabs, type TabItem } from '@pxlkit/ui-kit-vue';

const many: TabItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: `tab-${i + 1}`,
  label: `Section ${i + 1}`,
  content: () => h('p', `Contents of section ${i + 1}.`),
}));
</script>

<template>
  <div class="max-w-sm">
    <PixelTabs :items="many" default-value="tab-1" scrollable aria-label="Scrollable tabs" />
  </div>
</template>
