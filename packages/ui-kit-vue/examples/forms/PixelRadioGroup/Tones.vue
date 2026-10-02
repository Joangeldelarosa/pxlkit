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
  <div class="grid grid-cols-2 gap-6">
    <PixelRadioGroup v-model="value" label="Neutral" tone="neutral" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Green" tone="green" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Cyan" tone="cyan" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Gold" tone="gold" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Red" tone="red" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Purple" tone="purple" :options="PLANS" />
    <PixelRadioGroup v-model="value" label="Pink" tone="pink" :options="PLANS" />
  </div>
</template>
