<script setup lang="ts">
import { ref } from 'vue';
import { PixelDropdownContent, PixelDropdownItem, PixelDropdownRoot, PixelDropdownTrigger } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelDropdownRoot v-model:open="open">
    <PixelDropdownTrigger>{{ open ? 'Close' : 'Open' }} menu</PixelDropdownTrigger>
    <PixelDropdownContent>
      <PixelDropdownItem value="one" @select="() => {}">One</PixelDropdownItem>
      <PixelDropdownItem value="two" @select="() => {}">Two</PixelDropdownItem>
    </PixelDropdownContent>
  </PixelDropdownRoot>
</template>
