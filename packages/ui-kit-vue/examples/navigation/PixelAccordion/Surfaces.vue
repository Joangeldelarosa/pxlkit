<script setup lang="ts">
import { PixelAccordion, type AccordionItem } from '@pxlkit/ui-kit-vue';

const items: AccordionItem[] = [
  { id: 'overview', title: 'Overview', content: 'Introductory section that opens by default.' },
  { id: 'details', title: 'Details', content: 'Secondary section with extended copy.' },
  { id: 'faq', title: 'FAQ', content: 'Common questions and short answers.' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <PixelAccordion :items="items" surface="pixel" />
    <PixelAccordion :items="items" surface="linear" />
  </div>
</template>
