<script setup lang="ts">
import { ref } from 'vue';
import { PixelOTPInput } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <PixelOTPInput v-model="value" :length="6">
    <template #separator><span>-</span></template>
  </PixelOTPInput>
</template>
