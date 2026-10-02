<script setup lang="ts">
import { ref } from 'vue';
import { PixelRadioGroup } from '@pxlkit/ui-kit-vue';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
const value = ref('pro');
</script>

<template>
  <div class="space-y-2">
    <PixelRadioGroup v-model="value" label="Selected plan" :options="PLANS" tone="cyan" />
    <p class="text-xs text-retro-muted">Picked: {{ value }}</p>
  </div>
</template>
