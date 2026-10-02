<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="3" :gap="4">
    <PixelBentoCell span="1x1" kind="feature" tone="neutral">Neutral</PixelBentoCell>
    <PixelBentoCell span="1x1" kind="feature" tone="cyan">Cyan</PixelBentoCell>
    <PixelBentoCell span="1x1" kind="feature" tone="green">Green</PixelBentoCell>
    <PixelBentoCell span="1x1" kind="feature" tone="gold">Gold</PixelBentoCell>
    <PixelBentoCell span="1x1" kind="feature" tone="red">Red</PixelBentoCell>
    <PixelBentoCell span="1x1" kind="feature" tone="purple">Purple</PixelBentoCell>
  </PixelBento>
</template>
