<script setup lang="ts">
import { ref } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const checked = ref(false);
</script>

<template>
  <PixelCheckbox v-model:checked="checked" label="Accept terms" />
</template>
