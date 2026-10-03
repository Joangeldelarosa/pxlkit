<script setup lang="ts">
import { ref } from 'vue';
import { PixelCalendarGrid } from '@pxlkit/ui-kit-vue';

const value = ref<Date | null>(null);
</script>

<template>
  <PixelCalendarGrid v-model="value" />
</template>
