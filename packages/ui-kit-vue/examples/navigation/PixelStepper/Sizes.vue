<script setup lang="ts">
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-6">
    <PixelStepper :active="1" size="sm">
      <PixelStepperStep label="One" />
      <PixelStepperStep label="Two" />
      <PixelStepperStep label="Three" />
    </PixelStepper>
    <PixelStepper :active="1" size="md">
      <PixelStepperStep label="One" />
      <PixelStepperStep label="Two" />
      <PixelStepperStep label="Three" />
    </PixelStepper>
    <PixelStepper :active="1" size="lg">
      <PixelStepperStep label="One" />
      <PixelStepperStep label="Two" />
      <PixelStepperStep label="Three" />
    </PixelStepper>
  </div>
</template>
