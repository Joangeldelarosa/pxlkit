<script setup lang="ts">
import { PIXEL_GLYPHS, PIXEL_GLYPH_STYLE, PIXEL_GLYPH_VIEWBOX, type PixelGlyphName } from '@pxlkit/ui-kit-core';

/** One of the kit's built-in pixel glyphs; extra classes fall through. */
defineProps<{ name: PixelGlyphName }>();
</script>

<template>
  <svg
    :viewBox="PIXEL_GLYPH_VIEWBOX"
    :class="PIXEL_GLYPHS[name].className"
    shape-rendering="crispEdges"
    fill="currentColor"
    preserveAspectRatio="xMidYMid meet"
    :style="PIXEL_GLYPH_STYLE"
  >
    <rect
      v-for="[x, y, width, height] in PIXEL_GLYPHS[name].rects"
      :key="`${x}-${y}`"
      :x="x"
      :y="y"
      :width="width"
      :height="height"
    />
  </svg>
</template>
