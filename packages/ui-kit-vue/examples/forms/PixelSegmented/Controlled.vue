<script setup lang="ts">
import { ref } from 'vue';
import { PixelSegmented } from '@pxlkit/ui-kit-vue';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];
const value = ref('list');
</script>

<template>
  <div class="space-y-2">
    <PixelSegmented v-model="value" label="Active view" :options="VIEWS" tone="cyan" />
    <p class="text-xs text-retro-muted">Picked: {{ value }}</p>
  </div>
</template>
