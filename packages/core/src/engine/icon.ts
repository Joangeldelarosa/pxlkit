import type { IconAppearance, Pixel, PxlKitData } from '../types';
import { gridToPixels } from '../utils/gridToPixels';
import type { StyleMap } from './style';

/** Colour options shared by every icon renderer. See {@link IconAppearance}. */
export interface IconRenderOptions {
  /** Colour mode (default: `'palette'`). */
  appearance?: IconAppearance;
  /**
   * Tint hue (`'tinted'`) or flat colour (`'solid'`). Ignored by `'palette'`.
   * Defaults to `#FFFFFF`: the SVG is rendered inside an `<img>`, an isolated
   * document where `currentColor` cannot reach the surrounding text colour.
   */
  color?: string;
}

/** Colour used by `'tinted'` / `'solid'` when no `color` is given. */
const FALLBACK_COLOR = '#FFFFFF';

/** Escapes a value for safe interpolation inside a double-quoted XML attribute. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/**
 * Builds the standalone SVG document every icon component renders.
 *
 * The SVG is drawn at the icon's native grid (`viewBox="0 0 16 16"` for a
 * 16-grid) with `shape-rendering="crispEdges"`; consecutive pixels of the same
 * colour and opacity on a row are merged into one `<rect>` to keep the markup
 * small.
 *
 * Colour modes:
 * - `'palette'` — the artwork's own colours.
 * - `'tinted'` — palette plus an `feFlood` + `feComposite` + `feBlend
 *   mode="color"` filter: every pixel adopts the tint's hue and saturation
 *   while keeping its own luminance, so shading survives.
 * - `'solid'` — every pixel flattened to `color`.
 */
export function renderIconSvg(icon: PxlKitData, options: IconRenderOptions = {}): string {
  const appearance = options.appearance ?? 'palette';
  const color = options.color || FALLBACK_COLOR;
  const usePalette = appearance !== 'solid';

  // Group by row for horizontal merging into wider rects.
  const rows = new Map<number, Pixel[]>();
  for (const pixel of gridToPixels(icon)) {
    const row = rows.get(pixel.y);
    if (row) row.push(pixel);
    else rows.set(pixel.y, [pixel]);
  }

  const rects: string[] = [];
  for (const [y, rowPixels] of rows) {
    const sorted = rowPixels.sort((a, b) => a.x - b.x);
    let i = 0;
    while (i < sorted.length) {
      const start = sorted[i];
      const opacity = start.opacity ?? 1;
      let width = 1;
      while (
        i + width < sorted.length &&
        sorted[i + width].x === start.x + width &&
        (!usePalette || sorted[i + width].color === start.color) &&
        (sorted[i + width].opacity ?? 1) === opacity
      ) {
        width++;
      }
      const fill = escapeAttribute(usePalette ? start.color : color);
      const opacityAttr = opacity < 1 ? ` fill-opacity="${opacity}"` : '';
      rects.push(
        `<rect x="${start.x}" y="${y}" width="${width}" height="1" fill="${fill}"${opacityAttr}/>`,
      );
      i += width;
    }
  }

  // Tint pipeline: feFlood paints the tint, feComposite operator="in" crops it
  // to the artwork's alpha, and feBlend mode="color" puts that silhouette ON
  // TOP of the original — the result takes hue + saturation from the tint and
  // luminosity from the artwork, so pixel-art shading is preserved.
  const tinted = appearance === 'tinted';
  const defs = tinted
    ? `<defs><filter id="pxk-tint"><feFlood flood-color="${escapeAttribute(color)}" flood-opacity="1" result="flood"/><feComposite in="flood" in2="SourceGraphic" operator="in" result="tinted"/><feBlend in="tinted" in2="SourceGraphic" mode="color"/></filter></defs>`
    : '';
  const body = tinted ? `<g filter="url(#pxk-tint)">${rects.join('')}</g>` : rects.join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.size} ${icon.size}" shape-rendering="crispEdges">${defs}${body}</svg>`;
}

/**
 * {@link renderIconSvg} encoded as a `data:image/svg+xml` URI, ready for an
 * `<img src>`. `encodeURIComponent` keeps the URI short and Unicode-safe.
 *
 * Rendering through `<img>` (rather than inline `<svg>`) is what keeps pixel
 * art crisp at every size: the browser rasterises the SVG at its native grid
 * and scales it with nearest-neighbour sampling (`image-rendering:
 * pixelated`), so no pixel column can collapse at non-integer scales.
 */
export function renderIconDataUri(icon: PxlKitData, options: IconRenderOptions = {}): string {
  return `data:image/svg+xml,${encodeURIComponent(renderIconSvg(icon, options))}`;
}

/** Accessible name of a rendered icon: the explicit label, else the icon's name. */
export function resolveIconLabel(icon: { name: string }, label?: string): string {
  return label || icon.name;
}

/**
 * Inline style of the icon `<img>`: inline-block, middle-aligned, never
 * shrunk inside flex rows, scaled with nearest-neighbour sampling.
 */
export const ICON_IMAGE_STYLE: StyleMap = Object.freeze({
  display: 'inline-block',
  verticalAlign: 'middle',
  flexShrink: '0',
  imageRendering: 'pixelated',
});
