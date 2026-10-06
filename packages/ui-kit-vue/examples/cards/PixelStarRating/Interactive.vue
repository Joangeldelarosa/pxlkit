<script setup lang="ts">
import { ref } from 'vue';
import { PixelStarRating } from '@pxlkit/ui-kit-vue';

const rating = ref(3);
</script>

<template>
  <PixelStarRating v-model="rating" interactive />
</template>
