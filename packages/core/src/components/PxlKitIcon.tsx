import React, { useMemo } from 'react';
import type { IconAppearance, PxlKitProps } from '../types';
import { gridToPixels } from '../utils/gridToPixels';

/**
 * Renders a pixel art icon as an `<img>` element whose `src` is an inline
 * SVG document encoded as a data URI (MIME `image/svg+xml`).
 *
 * **The icon is still SVG end-to-end — no raster anywhere.** The data URI
 * carries the full `<svg>...<rect>...</svg>` markup; the browser parses
 * it with its native SVG parser (same as inline `<svg>`), so the artwork
 * remains vector at every stage (hi-DPI sharp, infinitely zoomable, the
 * markup can be inspected/exported directly from the `src` attribute).
 *
 * **Why pipe SVG through `<img>` instead of using inline `<svg>`?** Because
 * CSS `image-rendering: pixelated` (the nearest-neighbour directive that
 * keeps pixel art crisp at arbitrary sizes) is only honoured reliably for
 * *image sources* — `<img>`, `<canvas>`, CSS `background-image`. On inline
 * `<svg>` with `shape-rendering="crispEdges"` + CSS `transform: scale()`,
 * all three engines (Blink/Gecko/WebKit) do vector scaling with sub-pixel
 * coverage; at sub-integer scales (e.g. `size=14` rendered from a 16-grid
 * = 0.875×) the rightmost pixel column collapses below 1 CSS pixel and
 * silently disappears.
 *
 * By embedding the same SVG inside an `<img>`, the browser rasterises the
 * SVG once at its intrinsic viewBox size (e.g. 16×16) and then scales the
 * intermediate buffer to the final visual size with nearest-neighbour
 * sampling, preserving every source pixel from 8 px up to 512 px and
 * beyond. The source format is unchanged — what changes is where in the
 * pipeline the rasteriser sits.
 *
 * **Colour modes** (see {@link IconAppearance}):
 * - `appearance="palette"` (default) — original artwork colours.
 * - `appearance="tinted"`            — palette + colour overlay via SVG
 *   `feFlood` + `feBlend mode="color"`. Preserves luminance & detail.
 * - `appearance="solid"`             — flatten every pixel to `color`
 *   (currentColor is NOT honoured here because `<img>` is an isolated
 *   context — pass an explicit `color` for solid mode).
 */
export function PxlKitIcon({
  icon,
  size = 32,
  appearance: appearanceProp,
  color: colorProp,
  className = '',
  style,
  'aria-label': ariaLabel,
  // Deprecated legacy props — resolved into `appearance` below.
  colorful: colorfulProp,
  solid: solidProp,
  tint: tintProp,
}: PxlKitProps) {
  // Resolve effective appearance + colour with backward-compat fallbacks.
  // Priority: explicit `appearance` > `solid` > `tint` > `colorful=false`
  // > default `'palette'`.
  const appearance: IconAppearance =
    appearanceProp ??
    (solidProp ? 'solid' :
     tintProp ? 'tinted' :
     colorfulProp === false ? 'solid' :
     'palette');
  const color = colorProp ?? tintProp;

  // Build a complete SVG string at the icon's native pixel grid (e.g. 16×16).
  // Encode as data URI and feed to <img>, which gives us guaranteed
  // nearest-neighbour scaling via CSS `image-rendering: pixelated`.
  const dataUri = useMemo(() => {
    const pixels = gridToPixels(icon);

    // Group by row for horizontal merging into wider rects.
    const rowMap = new Map<number, typeof pixels>();
    for (const p of pixels) {
      const row = rowMap.get(p.y) || [];
      row.push(p);
      rowMap.set(p.y, row);
    }

    const usePalette = appearance !== 'solid';
    // currentColor is not honoured inside <img> — fall back to a sensible default.
    const solidFill = color || '#FFFFFF';

    const rectStrings: string[] = [];
    for (const [y, rowPixels] of rowMap) {
      const sorted = rowPixels.sort((a, b) => a.x - b.x);
      let i = 0;
      while (i < sorted.length) {
        const start = sorted[i];
        const fill = usePalette ? start.color : solidFill;
        const startOpacity = start.opacity ?? 1;
        let width = 1;
        while (
          i + width < sorted.length &&
          sorted[i + width].x === start.x + width &&
          (!usePalette || sorted[i + width].color === start.color) &&
          (sorted[i + width].opacity ?? 1) === startOpacity
        ) {
          width++;
        }
        const opAttr = startOpacity < 1 ? ` fill-opacity="${startOpacity}"` : '';
        rectStrings.push(
          `<rect x="${start.x}" y="${y}" width="${width}" height="1" fill="${fill}"${opAttr}/>`,
        );
        i += width;
      }
    }

    const tintActive = appearance === 'tinted';
    const tintColor = color || '#FFFFFF';

    const filterDef = tintActive
      ? `<defs><filter id="pxk-tint"><feFlood flood-color="${tintColor}" flood-opacity="1" result="flood"/><feComposite in="flood" in2="SourceGraphic" operator="in" result="tinted"/><feBlend in="SourceGraphic" in2="tinted" mode="color"/></filter></defs>`
      : '';

    const bodyOpen = tintActive ? '<g filter="url(#pxk-tint)">' : '';
    const bodyClose = tintActive ? '</g>' : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.size} ${icon.size}" shape-rendering="crispEdges">${filterDef}${bodyOpen}${rectStrings.join('')}${bodyClose}</svg>`;

    // `encodeURIComponent` is safer than base64 for SVGs — produces shorter
    // URIs and avoids encoding errors with Unicode in the markup.
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [icon, appearance, color]);

  return (
    <img
      src={dataUri}
      width={size}
      height={size}
      alt={ariaLabel || icon.name}
      className={className}
      draggable={false}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        // Nearest-neighbour scaling — the secret to pixel-perfect rendering
        // at every size. Supported in every modern browser.
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
}
