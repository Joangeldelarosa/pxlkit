<script setup lang="ts">
import { ref } from 'vue';
import { PixelTextarea } from '@pxlkit/ui-kit-vue';

const value = ref('Short blurb');
</script>

<template>
  <PixelTextarea v-model="value" label="Short bio" :show-count="{ max: 140 }" placeholder="Up to 140 characters" />
</template>
