<script setup lang="ts">
import { ref } from 'vue';
import { PixelInput } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <PixelInput v-model="value" label="Email" type="email" placeholder="hero@pxlkit.xyz" tone="cyan" />
</template>
