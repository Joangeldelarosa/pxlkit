<script setup lang="ts">
import { PixelAvatar } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex items-center gap-3">
    <PixelAvatar name="Online User" status="online" />
    <PixelAvatar name="Away User" status="away" />
    <PixelAvatar name="Busy User" status="busy" />
    <PixelAvatar name="Offline User" status="offline" />
  </div>
</template>
