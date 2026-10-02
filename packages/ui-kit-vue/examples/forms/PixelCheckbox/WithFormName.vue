<script setup lang="ts">
import { ref } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const checked = ref(true);
</script>

<template>
  <form>
    <PixelCheckbox v-model:checked="checked" label="Remember me" name="remember" value="yes" />
  </form>
</template>
