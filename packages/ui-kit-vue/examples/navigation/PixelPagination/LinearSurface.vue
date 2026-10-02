<script setup lang="ts">
import { ref } from 'vue';
import { PixelPagination } from '@pxlkit/ui-kit-vue';

const page = ref(3);
</script>

<template>
  <PixelPagination v-model:page="page" :total="12" surface="linear" />
</template>
