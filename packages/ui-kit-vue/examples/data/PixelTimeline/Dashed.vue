<script setup lang="ts">
import { PixelTimeline, PixelTimelineItem } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTimeline :active="0" bullet-size="lg">
    <PixelTimelineItem title="Draft" line-variant="dashed">Currently editing.</PixelTimelineItem>
    <PixelTimelineItem title="Review" line-variant="dashed">Pending approval.</PixelTimelineItem>
    <PixelTimelineItem title="Published" line-variant="dashed" />
  </PixelTimeline>
</template>
