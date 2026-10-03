<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const neutral = ref(40);
const green = ref(50);
const cyan = ref(60);
const gold = ref(70);
const red = ref(30);
const purple = ref(45);
const pink = ref(55);
</script>

<template>
  <div class="space-y-4">
    <PixelSlider v-model="neutral" label="Neutral" tone="neutral" />
    <PixelSlider v-model="green" label="Green" tone="green" />
    <PixelSlider v-model="cyan" label="Cyan" tone="cyan" />
    <PixelSlider v-model="gold" label="Gold" tone="gold" />
    <PixelSlider v-model="red" label="Red" tone="red" />
    <PixelSlider v-model="purple" label="Purple" tone="purple" />
    <PixelSlider v-model="pink" label="Pink" tone="pink" />
  </div>
</template>
