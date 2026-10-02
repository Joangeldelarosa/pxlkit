<script setup lang="ts">
import { ref } from 'vue';
import { PixelDrawer, PixelDrawerBody, PixelDrawerFooter, PixelDrawerHeader } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open drawer</button>
  <PixelDrawer v-model:open="open" title="Settings">
    <PixelDrawerHeader>
      <span>Settings</span>
      <button type="button" @click="open = false">Close</button>
    </PixelDrawerHeader>
    <PixelDrawerBody>
      <p>Drawer content goes here.</p>
    </PixelDrawerBody>
    <PixelDrawerFooter>
      <button type="button" @click="open = false">Done</button>
    </PixelDrawerFooter>
  </PixelDrawer>
</template>
