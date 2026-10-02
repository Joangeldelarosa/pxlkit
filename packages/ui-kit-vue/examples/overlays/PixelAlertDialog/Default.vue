<script setup lang="ts">
import { ref } from 'vue';
import { PixelAlertDialog } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <div>
    <button type="button" @click="open = true">Open alert dialog</button>
    <PixelAlertDialog
      v-model:open="open"
      title="Save changes?"
      description="Your edits will be applied to the live document."
      action-label="Save"
      @action="open = false"
    />
  </div>
</template>
