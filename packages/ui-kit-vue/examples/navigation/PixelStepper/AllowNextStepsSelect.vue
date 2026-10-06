<script setup lang="ts">
import { ref } from 'vue';
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';

const active = ref(1);
</script>

<template>
  <PixelStepper :active="active" allow-next-steps-select @step-click="active = $event">
    <PixelStepperStep label="Intro" description="Welcome" />
    <PixelStepperStep label="Details" description="Tell us more" />
    <PixelStepperStep label="Review" description="Almost there" />
    <PixelStepperStep label="Finish" description="Complete" />
  </PixelStepper>
</template>
