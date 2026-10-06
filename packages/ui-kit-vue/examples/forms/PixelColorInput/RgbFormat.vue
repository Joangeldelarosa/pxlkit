<script setup lang="ts">
import { ref } from 'vue';
import { PixelColorInput } from '@pxlkit/ui-kit-vue';

const value = ref('rgb(34, 197, 94)');
</script>

<template>
  <PixelColorInput v-model="value" label="Accent color" format="rgb" hint="Stored as rgb()" />
</template>
