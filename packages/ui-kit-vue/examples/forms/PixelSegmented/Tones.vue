<script setup lang="ts">
import { ref } from 'vue';
import { PixelSegmented } from '@pxlkit/ui-kit-vue';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];
const value = ref('grid');
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <PixelSegmented v-model="value" label="Neutral" tone="neutral" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Green" tone="green" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Cyan" tone="cyan" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Gold" tone="gold" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Red" tone="red" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Purple" tone="purple" :options="VIEWS" />
    <PixelSegmented v-model="value" label="Pink" tone="pink" :options="VIEWS" />
  </div>
</template>
