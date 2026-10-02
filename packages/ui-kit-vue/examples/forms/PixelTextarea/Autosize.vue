<script setup lang="ts">
import { ref } from 'vue';
import { PixelTextarea } from '@pxlkit/ui-kit-vue';

const value = ref('Type more lines to watch this grow.\nIt will expand between minRows and maxRows.');
</script>

<template>
  <PixelTextarea v-model="value" label="Auto-grow" autosize :min-rows="2" :max-rows="8" />
</template>
