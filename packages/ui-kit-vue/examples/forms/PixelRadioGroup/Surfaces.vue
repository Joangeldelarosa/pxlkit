<script setup lang="ts">
import { ref } from 'vue';
import { PixelRadioGroup } from '@pxlkit/ui-kit-vue';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
const pixel = ref('pro');
const linear = ref('pro');
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <PixelRadioGroup v-model="pixel" label="Pixel surface" surface="pixel" :options="PLANS" />
    <PixelRadioGroup v-model="linear" label="Linear surface" surface="linear" :options="PLANS" />
  </div>
</template>
