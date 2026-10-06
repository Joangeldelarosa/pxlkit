<script setup lang="ts">
import { PixelAvatar, PixelAvatarGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelAvatarGroup aria-label="Cyan team" tone="cyan" :max="3">
      <PixelAvatar name="Ana Lopez" tone="cyan" />
      <PixelAvatar name="Bob Brown" tone="cyan" />
      <PixelAvatar name="Carol Chen" tone="cyan" />
      <PixelAvatar name="Dave Diaz" tone="cyan" />
    </PixelAvatarGroup>
    <PixelAvatarGroup aria-label="Gold team" tone="gold" :max="3">
      <PixelAvatar name="Ana Lopez" tone="gold" />
      <PixelAvatar name="Bob Brown" tone="gold" />
      <PixelAvatar name="Carol Chen" tone="gold" />
      <PixelAvatar name="Dave Diaz" tone="gold" />
    </PixelAvatarGroup>
    <PixelAvatarGroup aria-label="Purple team" tone="purple" :max="3">
      <PixelAvatar name="Ana Lopez" tone="purple" />
      <PixelAvatar name="Bob Brown" tone="purple" />
      <PixelAvatar name="Carol Chen" tone="purple" />
      <PixelAvatar name="Dave Diaz" tone="purple" />
    </PixelAvatarGroup>
  </div>
</template>
