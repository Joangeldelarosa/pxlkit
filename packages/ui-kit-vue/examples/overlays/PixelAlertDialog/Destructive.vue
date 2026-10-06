<script setup lang="ts">
import { ref } from 'vue';
import { PixelAlertDialog } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <div>
    <button type="button" @click="open = true">Delete item</button>
    <PixelAlertDialog
      v-model:open="open"
      title="Delete this item?"
      description="This action cannot be undone."
      cancel-label="Keep"
      action-label="Delete"
      destructive
      @action="open = false"
    />
  </div>
</template>
