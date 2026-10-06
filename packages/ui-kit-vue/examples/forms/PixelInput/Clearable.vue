<script setup lang="ts">
import { ref } from 'vue';
import { PixelInput } from '@pxlkit/ui-kit-vue';

const value = ref('clear me');
</script>

<template>
  <PixelInput v-model="value" label="Clearable" clearable />
</template>
