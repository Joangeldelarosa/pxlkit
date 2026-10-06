<script setup lang="ts">
import { Heart } from '@pxlkit/gamification';
import { PxlKitIcon } from '@pxlkit/vue';
import { PixelStarRating } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStarRating :model-value="3">
    <template #star-icon>
      <PxlKitIcon :icon="Heart" :size="20" appearance="solid" color="#EF4444" />
    </template>
  </PixelStarRating>
</template>
