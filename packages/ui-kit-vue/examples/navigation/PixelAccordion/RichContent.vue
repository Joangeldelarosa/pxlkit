<script setup lang="ts">
import { h } from 'vue';
import { PixelAccordion, type AccordionItem } from '@pxlkit/ui-kit-vue';

const items: AccordionItem[] = [
  {
    id: 'changelog',
    title: 'Changelog v1.2.0',
    content: () =>
      h('ul', { class: 'list-disc pl-4' }, [
        h('li', 'Added accordion keyboard wiring'),
        h('li', 'Surface-aware typography'),
        h('li', 'Optional multi-open behaviour'),
      ]),
  },
  {
    id: 'migration',
    title: 'Migration notes',
    content: () => h('p', ['Pass ', h('code', 'collapsedByDefault'), ' to keep every item closed on first render.']),
  },
];
</script>

<template>
  <PixelAccordion :items="items" />
</template>
