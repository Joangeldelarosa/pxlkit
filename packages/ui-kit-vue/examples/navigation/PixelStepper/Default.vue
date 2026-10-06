<script setup lang="ts">
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStepper :active="1">
    <PixelStepperStep label="Account" description="Create your account" />
    <PixelStepperStep label="Profile" description="Add some details" />
    <PixelStepperStep label="Confirm" description="Review and submit" />
  </PixelStepper>
</template>
