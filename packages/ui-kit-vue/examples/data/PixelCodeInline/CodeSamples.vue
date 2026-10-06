<script setup lang="ts">
import { PixelCodeInline } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>Import: <PixelCodeInline>import { PixelCodeInline } from '@pxlkit/ui-kit'</PixelCodeInline></div>
    <div>Hotkey: <PixelCodeInline tone="purple">Ctrl+K</PixelCodeInline></div>
    <div>Error: <PixelCodeInline tone="red">EACCES</PixelCodeInline></div>
  </div>
</template>
