<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { PixelBareInput } from '@pxlkit/ui-kit-vue';

// The component's root element (`$el`) is the native input.
const field = useTemplateRef<InstanceType<typeof PixelBareInput>>('field');
</script>

<template>
  <PixelBareInput ref="field" placeholder="Focus me via ref" />
</template>
