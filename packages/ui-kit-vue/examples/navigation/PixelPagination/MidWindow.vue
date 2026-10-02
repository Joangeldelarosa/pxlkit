<script setup lang="ts">
import { ref } from 'vue';
import { PixelPagination } from '@pxlkit/ui-kit-vue';

const page = ref(10);
</script>

<template>
  <PixelPagination v-model:page="page" :total="20" />
</template>
