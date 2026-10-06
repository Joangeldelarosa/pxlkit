<script setup lang="ts">
import { PixelAvatar, PixelAvatarGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelAvatarGroup aria-label="Pixel surface group" surface="pixel">
      <PixelAvatar name="Ana Lopez" surface="pixel" />
      <PixelAvatar name="Bob Brown" surface="pixel" />
      <PixelAvatar name="Carol Chen" surface="pixel" />
    </PixelAvatarGroup>
    <PixelAvatarGroup aria-label="Linear surface group" surface="linear">
      <PixelAvatar name="Ana Lopez" surface="linear" />
      <PixelAvatar name="Bob Brown" surface="linear" />
      <PixelAvatar name="Carol Chen" surface="linear" />
    </PixelAvatarGroup>
  </div>
</template>
