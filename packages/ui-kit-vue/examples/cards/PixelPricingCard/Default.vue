<script setup lang="ts">
import { PixelPricingCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelPricingCard
    tone="cyan"
    name="Starter"
    description="Everything you need to ship your first project."
    :price="{ amount: '$19', period: '/mo' }"
    :features="[
      { label: '10 projects' },
      { label: 'Basic analytics' },
      { label: 'Email support' },
      { label: 'Priority support', included: false },
    ]"
  />
</template>
