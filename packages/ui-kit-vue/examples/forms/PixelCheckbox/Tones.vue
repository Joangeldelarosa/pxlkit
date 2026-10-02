<script setup lang="ts">
import { reactive } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const values = reactive({
  neutral: true,
  green: true,
  cyan: true,
  gold: true,
  red: true,
  purple: true,
  pink: true,
});
</script>

<template>
  <div class="space-y-2">
    <PixelCheckbox v-model:checked="values.neutral" label="Neutral" tone="neutral" />
    <PixelCheckbox v-model:checked="values.green" label="Green" tone="green" />
    <PixelCheckbox v-model:checked="values.cyan" label="Cyan" tone="cyan" />
    <PixelCheckbox v-model:checked="values.gold" label="Gold" tone="gold" />
    <PixelCheckbox v-model:checked="values.red" label="Red" tone="red" />
    <PixelCheckbox v-model:checked="values.purple" label="Purple" tone="purple" />
    <PixelCheckbox v-model:checked="values.pink" label="Pink" tone="pink" />
  </div>
</template>
