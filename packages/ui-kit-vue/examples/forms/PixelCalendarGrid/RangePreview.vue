<script setup lang="ts">
import { PixelCalendarGrid } from '@pxlkit/ui-kit-vue';

const from = new Date();
const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 5);
</script>

<template>
  <PixelCalendarGrid :range-preview="{ from, to }" />
</template>
