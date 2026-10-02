<script setup lang="ts">
import { ref } from 'vue';
import { PixelPagination } from '@pxlkit/ui-kit-vue';

const page = ref(2);
</script>

<template>
  <PixelPagination
    v-model:page="page"
    :total="8"
    prev-label="Anterior"
    next-label="Siguiente"
    aria-label="Paginación"
  />
</template>
