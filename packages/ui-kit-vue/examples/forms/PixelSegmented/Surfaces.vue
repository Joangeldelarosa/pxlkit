<script setup lang="ts">
import { ref } from 'vue';
import { PixelSegmented } from '@pxlkit/ui-kit-vue';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];
const pixel = ref('grid');
const linear = ref('grid');
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <PixelSegmented v-model="pixel" label="Pixel surface" surface="pixel" :options="VIEWS" />
    <PixelSegmented v-model="linear" label="Linear surface" surface="linear" :options="VIEWS" />
  </div>
</template>
