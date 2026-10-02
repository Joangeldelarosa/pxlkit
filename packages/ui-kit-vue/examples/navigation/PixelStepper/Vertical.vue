<script setup lang="ts">
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStepper :active="1" orientation="vertical">
    <PixelStepperStep label="Upload" description="Pick a file" />
    <PixelStepperStep label="Process" description="Running checks" loading />
    <PixelStepperStep label="Publish" description="Make it live" />
  </PixelStepper>
</template>
