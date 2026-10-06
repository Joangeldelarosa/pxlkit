<script setup lang="ts">
import { ref } from 'vue';
import { PixelFileUpload } from '@pxlkit/ui-kit-vue';

const files = ref<File[]>([]);
</script>

<template>
  <PixelFileUpload v-model="files" label="Choose a file" :dropzone="false" />
</template>
