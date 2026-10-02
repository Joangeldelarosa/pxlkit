<script setup lang="ts">
import { ref } from 'vue';
import { PixelPasswordInput } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <PixelPasswordInput v-model="value" label="Password" :hint="`Length: ${value.length}`" />
</template>
