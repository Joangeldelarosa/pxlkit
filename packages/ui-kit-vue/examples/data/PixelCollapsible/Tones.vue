<script setup lang="ts">
import { PixelCollapsible } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelCollapsible label="Cyan section" tone="cyan">
      <p class="text-xs text-retro-muted">Cyan-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Green section" tone="green">
      <p class="text-xs text-retro-muted">Green-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Gold section" tone="gold">
      <p class="text-xs text-retro-muted">Gold-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Red section" tone="red">
      <p class="text-xs text-retro-muted">Red-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Purple section" tone="purple">
      <p class="text-xs text-retro-muted">Purple-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Pink section" tone="pink">
      <p class="text-xs text-retro-muted">Pink-tinted toggle.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Neutral section" tone="neutral">
      <p class="text-xs text-retro-muted">Neutral-tinted toggle.</p>
    </PixelCollapsible>
  </div>
</template>
