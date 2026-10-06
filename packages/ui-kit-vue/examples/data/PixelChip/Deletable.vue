<script setup lang="ts">
import { ref } from 'vue';
import { PixelChip } from '@pxlkit/ui-kit-vue';

const visible = ref(true);
</script>

<template>
  <PixelChip v-if="visible" label="Remove me" tone="red" @delete="visible = false" />
</template>
