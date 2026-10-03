<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard
    title="New Feature"
    :badge="{ label: 'NEW', tone: 'gold' }"
    description="Ribbon badge anchors in the top-right corner."
  >
    <p>Useful for highlighting fresh content.</p>
  </PixelCard>
</template>
