<script setup lang="ts">
import { ref } from 'vue';
import { PixelRadioGroup } from '@pxlkit/ui-kit-vue';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
const value = ref('');
</script>

<template>
  <PixelRadioGroup v-model="value" label="Pick a plan to continue" :options="PLANS" required />
</template>
