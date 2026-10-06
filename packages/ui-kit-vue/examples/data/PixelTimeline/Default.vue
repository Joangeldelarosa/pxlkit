<script setup lang="ts">
import { PixelTimeline, PixelTimelineItem } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTimeline :active="1">
    <PixelTimelineItem title="Order placed" time="09:00">Confirmation email sent.</PixelTimelineItem>
    <PixelTimelineItem title="Packed" time="11:20">At the warehouse.</PixelTimelineItem>
    <PixelTimelineItem title="Shipped" time="—">Awaiting carrier pickup.</PixelTimelineItem>
  </PixelTimeline>
</template>
