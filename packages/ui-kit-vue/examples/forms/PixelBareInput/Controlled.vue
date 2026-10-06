<script setup lang="ts">
import { ref } from 'vue';
import { PixelBareInput } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <PixelBareInput v-model="value" placeholder="Controlled" aria-label="controlled-input" />
</template>
