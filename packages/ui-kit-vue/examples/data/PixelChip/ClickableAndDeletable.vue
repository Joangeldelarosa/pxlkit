<script setup lang="ts">
import { ref } from 'vue';
import { PixelChip } from '@pxlkit/ui-kit-vue';

const visible = ref(true);

function select() {}
</script>

<template>
  <PixelChip v-if="visible" label="Tag" tone="purple" @click="select" @delete="visible = false" />
</template>
