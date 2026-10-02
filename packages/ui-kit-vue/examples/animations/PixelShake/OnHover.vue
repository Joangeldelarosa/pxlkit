<script setup lang="ts">
import { PixelShake } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelShake trigger="hover" repeat="infinite" :duration="300">
    <span>Hover to shake</span>
  </PixelShake>
</template>
