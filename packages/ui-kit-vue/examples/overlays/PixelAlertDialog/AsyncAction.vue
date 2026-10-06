<script setup lang="ts">
import { ref } from 'vue';
import { PixelAlertDialog } from '@pxlkit/ui-kit-vue';

const open = ref(false);
const error = ref<string | null>(null);

function show() {
  error.value = null;
  open.value = true;
}

const submit = () => new Promise<void>((resolve) => setTimeout(resolve, 600));
</script>

<template>
  <div>
    <button type="button" @click="show">Submit</button>
    <PixelAlertDialog
      v-model:open="open"
      title="Submit report?"
      :description="error ?? 'The report will be sent for review.'"
      action-label="Submit"
      @action="submit"
      @error="(e) => (error = e instanceof Error ? e.message : 'Failed')"
    />
  </div>
</template>
