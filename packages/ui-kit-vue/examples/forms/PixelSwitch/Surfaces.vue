<script setup lang="ts">
import { ref } from 'vue';
import { PixelSwitch } from '@pxlkit/ui-kit-vue';

const a = ref(true);
const b = ref(true);
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelSwitch v-model:checked="a" label="Pixel surface" surface="pixel" />
    <PixelSwitch v-model:checked="b" label="Linear surface" surface="linear" />
  </div>
</template>
