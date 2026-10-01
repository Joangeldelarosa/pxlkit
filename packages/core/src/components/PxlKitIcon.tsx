import { useMemo, type CSSProperties } from 'react';
import type { PxlKitProps } from './types';
import { ICON_IMAGE_STYLE, renderIconDataUri, resolveIconLabel } from '../engine/icon';
import { resolveColorProps } from './_internal/resolveColorProps';

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
 * The markup comes from the framework-agnostic engine
 * (`renderIconDataUri` in `@pxlkit/core/vanilla`), so `@pxlkit/vue` and
 * `@pxlkit/angular` render byte-identical icons.
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
  colorful,
  solid,
  tint,
}: PxlKitProps) {
  const { appearance, color } = resolveColorProps({
    appearance: appearanceProp,
    color: colorProp,
    colorful,
    solid,
    tint,
  });

  const src = useMemo(
    () => renderIconDataUri(icon, { appearance, color }),
    [icon, appearance, color],
  );

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={resolveIconLabel(icon, ariaLabel)}
      className={className}
      draggable={false}
      style={{ ...(ICON_IMAGE_STYLE as CSSProperties), ...style }}
    />
  );
}
