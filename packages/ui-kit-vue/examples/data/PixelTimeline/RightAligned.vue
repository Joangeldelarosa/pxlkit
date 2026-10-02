<script setup lang="ts">
import { PixelTimeline, PixelTimelineItem } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTimeline :active="2" align="right">
    <PixelTimelineItem title="Step 1" time="Mon" />
    <PixelTimelineItem title="Step 2" time="Tue" />
    <PixelTimelineItem title="Step 3" time="Wed" />
  </PixelTimeline>
</template>
