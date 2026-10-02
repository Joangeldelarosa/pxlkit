<script setup lang="ts">
import { ref } from 'vue';
import { PixelTextarea } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <PixelTextarea v-model="value" label="Message" placeholder="Type to see live updates..." :hint="`${value.length} chars`" />
</template>
