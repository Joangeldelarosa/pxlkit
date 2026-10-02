<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle } from '@pxlkit/ui-kit-vue';

const pressed = ref(false);
</script>

<template>
  <PixelToggle v-model:pressed="pressed" value="bold">Bold</PixelToggle>
</template>
