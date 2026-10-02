<script setup lang="ts">
import { PixelAvatar, PixelAvatarGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelAvatarGroup aria-label="6 team members" :max="4">
    <PixelAvatar name="Joangel De La Rosa" />
    <PixelAvatar name="Ana Lopez" />
    <PixelAvatar name="Carlos Diaz" />
    <PixelAvatar name="Diana Perez" />
    <PixelAvatar name="Eduardo Ruiz" />
    <PixelAvatar name="Fabiola Garcia" />
  </PixelAvatarGroup>
</template>
