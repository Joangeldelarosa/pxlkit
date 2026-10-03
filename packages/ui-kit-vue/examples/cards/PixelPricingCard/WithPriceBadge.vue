<script setup lang="ts">
import { PixelBadge, PixelPricingCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelPricingCard
    tone="green"
    name="Team"
    description="Annual billing with every collaboration feature unlocked, plus hands-on onboarding for larger workspaces — the description flows freely with descriptionLines set to 'none'."
    description-lines="none"
    :price="{ amount: '$39', period: '/mo', strikethrough: '$59' }"
    :features="[{ label: 'Unlimited projects' }, { label: 'SSO + audit log', highlight: true }, { label: 'Priority support' }]"
  >
    <template #price-badge><PixelBadge tone="green" size="sm">-33%</PixelBadge></template>
  </PixelPricingCard>
</template>
