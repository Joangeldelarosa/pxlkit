<script setup lang="ts">
import { ref } from 'vue';
import { PixelSplitButton } from '@pxlkit/ui-kit-vue';

const last = ref('—');
</script>

<template>
  <div class="flex flex-col items-start gap-2">
    <PixelSplitButton
      label="Save"
      tone="cyan"
      :options="[
        { value: 'draft', label: 'Save as draft' },
        { value: 'template', label: 'Save as template' },
        { value: 'copy', label: 'Save a copy' },
      ]"
      @primary="last = 'primary'"
      @select="(value) => (last = value)"
    />
    <span class="text-xs text-retro-muted">last action: {{ last }}</span>
  </div>
</template>
