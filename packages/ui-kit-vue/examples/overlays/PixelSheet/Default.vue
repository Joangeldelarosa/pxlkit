<script setup lang="ts">
import { ref } from 'vue';
import { PixelSheet } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open sheet</button>
  <PixelSheet v-model:open="open" title="Quick actions" description="Pick an action below">
    <p>Sheet content goes here.</p>
    <button type="button" @click="open = false">Close</button>
  </PixelSheet>
</template>
