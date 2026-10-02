<script setup lang="ts">
import { PixelShake } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelShake :distance="6" :duration="600" :repeat="3">
    <span>Stronger shake</span>
  </PixelShake>
</template>
