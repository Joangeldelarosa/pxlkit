<script setup lang="ts">
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <PixelStepper :active="1" surface="pixel" aria-label="Pixel stepper">
      <PixelStepperStep label="Start" />
      <PixelStepperStep label="Build" />
      <PixelStepperStep label="Ship" />
    </PixelStepper>
    <PixelStepper :active="1" surface="linear" aria-label="Linear stepper">
      <PixelStepperStep label="Start" />
      <PixelStepperStep label="Build" />
      <PixelStepperStep label="Ship" />
    </PixelStepper>
  </div>
</template>
