<script setup lang="ts">
import { PixelPricingCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelPricingCard
    tone="gold"
    highlight
    name="Pro"
    description="For teams that want more power and priority."
    :price="{ amount: '$49', period: '/mo', strikethrough: '$79' }"
    :popular="{ label: 'POPULAR', tone: 'gold' }"
    :features="[{ label: 'Unlimited projects' }, { label: 'Advanced analytics' }, { label: 'Priority support' }]"
  />
</template>
