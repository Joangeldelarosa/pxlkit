<script setup lang="ts">
import { ref } from 'vue';
import { PixelFileUpload } from '@pxlkit/ui-kit-vue';

const files = ref<File[]>([]);
</script>

<template>
  <PixelFileUpload
    v-model="files"
    label="Upload files"
    hint="PNG or JPG, up to 5 MB each"
    accept="image/*"
    multiple
    :max-size="5 * 1024 * 1024"
    :max-files="5"
  />
</template>
