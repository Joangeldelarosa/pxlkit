<script setup lang="ts">
import { reactive } from 'vue';
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';

const prefs = reactive({ email: true, sms: false, push: true });
</script>

<template>
  <div class="space-y-2">
    <PixelCheckbox v-model:checked="prefs.email" label="Email notifications" />
    <PixelCheckbox v-model:checked="prefs.sms" label="SMS notifications" />
    <PixelCheckbox v-model:checked="prefs.push" label="Push notifications" />
  </div>
</template>
