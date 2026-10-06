<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { PixelBareInput, PixelButton } from '@pxlkit/ui-kit-vue';

// The component's root element (`$el`) is the native input.
const field = useTemplateRef<InstanceType<typeof PixelBareInput>>('field');
</script>

<template>
  <div class="flex items-center gap-2">
    <PixelBareInput ref="field" placeholder="Focus me via ref" />
    <PixelButton size="sm" @click="field?.$el.focus()">Focus</PixelButton>
  </div>
</template>
