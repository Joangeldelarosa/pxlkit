/**
 * The kit's built-in pixel glyphs (chevron, check mark, close cross) as
 * plain data, so every framework draws the identical SVG:
 *
 * ```html
 * <svg viewBox="0 0 8 8" class="{size classes} {caller classes}"
 *      shape-rendering="crispEdges" fill="currentColor"
 *      preserveAspectRatio="xMidYMid meet" style="{PIXEL_GLYPH_STYLE}">
 *   <rect x y width height /> …
 * </svg>
 * ```
 */

/** A pixel rectangle on the glyph grid: `[x, y, width, height]`. */
export type PixelGlyphRect = readonly [x: number, y: number, width: number, height: number];

export interface PixelGlyph {
  /** Size classes, placed before the caller's classes. */
  readonly className: string;
  /** Filled pixels, drawn in order. */
  readonly rects: readonly PixelGlyphRect[];
}

export type PixelGlyphName = 'chevronDown' | 'check' | 'close';

/** `viewBox` shared by every glyph — an 8×8 pixel grid. */
export const PIXEL_GLYPH_VIEWBOX = '0 0 8 8';

/**
 * Inline style of every glyph. `inline-block` removes the descender gap;
 * `vertical-align: middle` aligns with adjacent text; `overflow: visible`
 * prevents accidental clipping; `flex-shrink: 0` keeps the glyph at its
 * declared size inside flex slots.
 */
export const PIXEL_GLYPH_STYLE = {
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'visible',
  flexShrink: 0,
} as const;

export const PIXEL_GLYPHS: Readonly<Record<PixelGlyphName, PixelGlyph>> = {
  chevronDown: {
    className: 'h-2.5 w-2.5 shrink-0',
    rects: [
      [1, 2, 1, 1],
      [2, 3, 1, 1],
      [3, 4, 2, 1],
      [5, 3, 1, 1],
      [6, 2, 1, 1],
    ],
  },
  check: {
    className: 'h-3 w-3 shrink-0',
    rects: [
      [6, 1, 1, 1],
      [5, 2, 1, 1],
      [4, 3, 1, 1],
      [3, 4, 1, 1],
      [2, 4, 1, 1],
      [1, 3, 1, 1],
    ],
  },
  close: {
    className: 'h-3 w-3 shrink-0',
    rects: [
      [1, 1, 1, 1],
      [2, 2, 1, 1],
      [5, 2, 1, 1],
      [6, 1, 1, 1],
      [3, 3, 2, 2],
      [1, 6, 1, 1],
      [2, 5, 1, 1],
      [5, 5, 1, 1],
      [6, 6, 1, 1],
    ],
  },
};
