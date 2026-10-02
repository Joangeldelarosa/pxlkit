<script setup lang="ts">
import { ref } from 'vue';
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-vue';

const active = ref(0);
const total = 4;
</script>

<template>
  <div class="space-y-3">
    <PixelStepper :active="active" @step-click="active = $event">
      <PixelStepperStep label="Plan" description="Pick a tier" />
      <PixelStepperStep label="Billing" description="Payment method" />
      <PixelStepperStep label="Confirm" description="Review charges" />
      <PixelStepperStep label="Done" description="All set" />
    </PixelStepper>
    <div class="flex gap-2">
      <button type="button" class="text-xs px-2 py-1 border border-retro-border" @click="active = Math.max(0, active - 1)">
        Back
      </button>
      <button
        type="button"
        class="text-xs px-2 py-1 border border-retro-border"
        @click="active = Math.min(total - 1, active + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
