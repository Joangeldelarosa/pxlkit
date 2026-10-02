<script setup lang="ts">
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStepper :active="2">
    <PixelStepperStep label="Created" completed />
    <PixelStepperStep label="Validated" completed />
    <PixelStepperStep label="Signing" loading />
    <PixelStepperStep label="Failed" error />
    <PixelStepperStep label="Done" />
  </PixelStepper>
</template>
