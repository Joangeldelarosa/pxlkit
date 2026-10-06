<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle } from '@pxlkit/ui-kit-vue';

const pressed = ref(true);
</script>

<template>
  <PixelToggle v-model:pressed="pressed" value="italic">Italic</PixelToggle>
</template>
