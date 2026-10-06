<script setup lang="ts">
import { PixelBareButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <form class="flex gap-2" @submit.prevent>
    <PixelBareButton type="submit">Submit</PixelBareButton>
    <PixelBareButton type="reset">Reset</PixelBareButton>
  </form>
</template>
