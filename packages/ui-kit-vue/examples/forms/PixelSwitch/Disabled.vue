<script setup lang="ts">
import { PixelSwitch } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelSwitch label="Disabled off" :checked="false" disabled />
    <PixelSwitch label="Disabled on" checked disabled />
  </div>
</template>
