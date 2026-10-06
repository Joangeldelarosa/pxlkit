<script setup lang="ts">
import {
  PixelDropdownContent,
  PixelDropdownHeader,
  PixelDropdownItem,
  PixelDropdownRoot,
  PixelDropdownSeparator,
  PixelDropdownTrigger,
} from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelDropdownRoot>
    <PixelDropdownTrigger>Menu</PixelDropdownTrigger>
    <PixelDropdownContent>
      <PixelDropdownHeader>Project</PixelDropdownHeader>
      <PixelDropdownItem value="rename" @select="() => {}">Rename</PixelDropdownItem>
      <PixelDropdownItem value="share" shortcut="Ctrl+E" @select="() => {}">Share</PixelDropdownItem>
      <PixelDropdownSeparator />
      <PixelDropdownItem value="delete" destructive @select="() => {}">Delete</PixelDropdownItem>
    </PixelDropdownContent>
  </PixelDropdownRoot>
</template>
