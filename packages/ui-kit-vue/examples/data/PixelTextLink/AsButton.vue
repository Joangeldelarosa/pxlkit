<script setup lang="ts">
import { PixelTextLink } from '@pxlkit/ui-kit-vue';

function onClick() {
  console.log('clicked');
}
</script>

<template>
  <PixelTextLink tone="cyan" @click="onClick">Trigger an action</PixelTextLink>
</template>
