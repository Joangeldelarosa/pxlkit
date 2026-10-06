<script setup lang="ts">
import { ref } from 'vue';
import { PixelSwitch } from '@pxlkit/ui-kit-vue';

const on = ref(true);
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelSwitch v-model:checked="on" label="Neutral" tone="neutral" />
    <PixelSwitch v-model:checked="on" label="Green" tone="green" />
    <PixelSwitch v-model:checked="on" label="Cyan" tone="cyan" />
    <PixelSwitch v-model:checked="on" label="Gold" tone="gold" />
    <PixelSwitch v-model:checked="on" label="Red" tone="red" />
    <PixelSwitch v-model:checked="on" label="Purple" tone="purple" />
    <PixelSwitch v-model:checked="on" label="Pink" tone="pink" />
  </div>
</template>
