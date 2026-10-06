<script setup lang="ts">
import { PixelAlert } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelAlert tone="neutral" title="Heads up" message="Neutral informational banner." />
    <PixelAlert tone="green" title="Saved" message="Your changes have been persisted." />
    <PixelAlert tone="cyan" title="New feature" message="Try the redesigned inbox." />
    <PixelAlert tone="gold" title="Warning" message="Storage is almost full." />
    <PixelAlert tone="red" title="Error" message="Failed to upload the file." />
    <PixelAlert tone="purple" title="Tip" message="Use ⌘K to jump anywhere." />
    <PixelAlert tone="pink" title="Highlight" message="You unlocked a new badge." />
  </div>
</template>
