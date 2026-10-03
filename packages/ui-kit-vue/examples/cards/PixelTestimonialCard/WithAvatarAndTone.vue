<script setup lang="ts">
import { PixelTestimonialCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTestimonialCard
    tone="cyan"
    quote="The retro surface tokens just clicked with our brand. Zero CSS surgery, all signal."
    name="Diego Salas"
    role="Staff Engineer"
    company="Halcyon Labs"
    :avatar="{ name: 'Diego Salas', tone: 'cyan' }"
    :stars="4"
  />
</template>
