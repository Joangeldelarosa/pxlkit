<script setup lang="ts">
import { ref } from 'vue';
import { PixelSwitch } from '@pxlkit/ui-kit-vue';

const on = ref(true);
</script>

<template>
  <PixelSwitch v-model:checked="on" label="Subscribe to newsletter" name="newsletter" value="yes" required />
</template>
