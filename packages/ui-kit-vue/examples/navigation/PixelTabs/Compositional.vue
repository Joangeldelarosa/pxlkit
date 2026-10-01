<script setup lang="ts">
import { PixelTabs, PixelTabsList, PixelTabsPanel, PixelTabsTrigger } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTabs default-value="one">
    <PixelTabsList aria-label="Compositional tabs">
      <PixelTabsTrigger value="one">One</PixelTabsTrigger>
      <PixelTabsTrigger value="two">Two</PixelTabsTrigger>
      <PixelTabsTrigger value="three">Three</PixelTabsTrigger>
    </PixelTabsList>
    <PixelTabsPanel value="one">First panel.</PixelTabsPanel>
    <PixelTabsPanel value="two">Second panel.</PixelTabsPanel>
    <PixelTabsPanel value="three">Third panel.</PixelTabsPanel>
  </PixelTabs>
</template>
