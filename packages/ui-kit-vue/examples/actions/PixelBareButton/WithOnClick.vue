<script setup lang="ts">
import { ref } from 'vue';
import { PixelBareButton } from '@pxlkit/ui-kit-vue';

const count = ref(0);
</script>

<template>
  <PixelBareButton @click="count++">Clicked {{ count }} times</PixelBareButton>
</template>
