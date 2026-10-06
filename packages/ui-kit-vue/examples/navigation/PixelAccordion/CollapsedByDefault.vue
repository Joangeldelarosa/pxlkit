<script setup lang="ts">
import { PixelAccordion, type AccordionItem } from '@pxlkit/ui-kit-vue';

const items: AccordionItem[] = [
  { id: 'overview', title: 'Overview', content: 'Introductory section that opens by default.' },
  { id: 'details', title: 'Details', content: 'Secondary section with extended copy.' },
  { id: 'faq', title: 'FAQ', content: 'Common questions and short answers.' },
];
</script>

<template>
  <PixelAccordion :items="items" collapsed-by-default />
</template>
