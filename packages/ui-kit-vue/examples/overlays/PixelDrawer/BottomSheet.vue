<script setup lang="ts">
import { ref } from 'vue';
import { PixelDrawer, PixelDrawerBody, PixelDrawerFooter } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open bottom sheet</button>
  <PixelDrawer v-model:open="open" side="bottom" size="md" title="Quick actions" description="Pick an action below">
    <PixelDrawerBody>
      <p>Sheet content.</p>
    </PixelDrawerBody>
    <PixelDrawerFooter>
      <button type="button" @click="open = false">Cancel</button>
    </PixelDrawerFooter>
  </PixelDrawer>
</template>
