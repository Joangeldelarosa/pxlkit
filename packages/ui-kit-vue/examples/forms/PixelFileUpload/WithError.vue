<script setup lang="ts">
import { PixelFileUpload } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFileUpload label="Attachments" error="At least one file is required" accept=".pdf,.doc,.docx" />
</template>
