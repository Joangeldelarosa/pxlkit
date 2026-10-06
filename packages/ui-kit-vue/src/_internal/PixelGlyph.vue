<script setup lang="ts">
import {
  PIXEL_GLYPHS,
  PIXEL_GLYPH_STYLE,
  PIXEL_GLYPH_VIEWBOX,
  pixelGlyphClasses,
  type PixelGlyphName,
} from '@pxlkit/ui-kit-core';

/**
 * One of the kit's built-in pixel glyphs; extra attributes fall through, and
 * a height or width among its classes replaces the glyph's own size.
 */
defineProps<{ name: PixelGlyphName }>();
defineOptions({ inheritAttrs: false });
</script>

<template>
  <svg
    v-bind="{ ...$attrs, class: undefined }"
    :viewBox="PIXEL_GLYPH_VIEWBOX"
    :class="pixelGlyphClasses(name, $attrs.class as string | undefined)"
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
