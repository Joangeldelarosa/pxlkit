<script setup lang="ts">
import { PixelAvatar, PixelAvatarGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelAvatarGroup aria-label="Extra small group" size="xs">
      <PixelAvatar name="Ana Lopez" size="xs" />
      <PixelAvatar name="Bob Brown" size="xs" />
      <PixelAvatar name="Carol Chen" size="xs" />
    </PixelAvatarGroup>
    <PixelAvatarGroup aria-label="Medium group" size="md">
      <PixelAvatar name="Ana Lopez" size="md" />
      <PixelAvatar name="Bob Brown" size="md" />
      <PixelAvatar name="Carol Chen" size="md" />
    </PixelAvatarGroup>
    <PixelAvatarGroup aria-label="Extra large group" size="xl">
      <PixelAvatar name="Ana Lopez" size="xl" />
      <PixelAvatar name="Bob Brown" size="xl" />
      <PixelAvatar name="Carol Chen" size="xl" />
    </PixelAvatarGroup>
  </div>
</template>
