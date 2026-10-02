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
  <form>
    <PixelRadioGroup v-model="value" label="Plan" name="plan" :options="PLANS" required />
  </form>
</template>
