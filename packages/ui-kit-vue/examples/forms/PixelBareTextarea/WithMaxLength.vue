<script setup lang="ts">
import { PixelBareTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareTextarea :maxlength="140" placeholder="Up to 140 characters" :rows="3" aria-label="Short bio" />
</template>
