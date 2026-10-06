<script setup lang="ts">
import { ref } from 'vue';
import { PixelDrawer, PixelDrawerBody, PixelDrawerHeader } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open left drawer</button>
  <PixelDrawer v-model:open="open" side="left" size="lg" title="Navigation">
    <PixelDrawerHeader>Navigation</PixelDrawerHeader>
    <PixelDrawerBody>
      <p>Menu items here.</p>
    </PixelDrawerBody>
  </PixelDrawer>
</template>
