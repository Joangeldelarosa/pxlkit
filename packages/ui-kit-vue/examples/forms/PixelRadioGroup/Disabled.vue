<script setup lang="ts">
import { PixelRadioGroup } from '@pxlkit/ui-kit-vue';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
</script>

<template>
  <PixelRadioGroup label="Plan (locked)" model-value="pro" :options="PLANS" disabled />
</template>
