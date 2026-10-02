<script setup lang="ts">
import { ref } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const pixel = ref(true);
const linear = ref(true);
</script>

<template>
  <div class="space-y-2">
    <PixelCheckbox v-model:checked="pixel" label="Pixel surface" surface="pixel" />
    <PixelCheckbox v-model:checked="linear" label="Linear surface" surface="linear" />
  </div>
</template>
