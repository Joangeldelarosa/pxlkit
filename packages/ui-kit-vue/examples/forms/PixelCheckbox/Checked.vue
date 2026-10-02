<script setup lang="ts">
import { ref } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const checked = ref(true);
</script>

<template>
  <PixelCheckbox v-model:checked="checked" label="Subscribe to newsletter" />
</template>
