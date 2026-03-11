import type { Pixel, SvgOptions } from '../types';

/**
 * Generates an SVG string from an array of pixels.
 *
 * Each pixel becomes a `<rect>` element. Uses `shape-rendering="crispEdges"`
 * to maintain the sharp pixel art look without anti-aliasing.
 *
 * Optimizes output by merging consecutive horizontal pixels of the same color
 * AND same opacity into wider rectangles, reducing SVG size.
 *
 * Supports per-pixel opacity via the `fill-opacity` attribute.
 *
 * @param pixels - Array of pixel data (with optional opacity)
 * @param gridSize - The grid dimension (e.g., 16 for 16x16)
 * @param options - SVG generation options
 * @returns SVG markup string
 */
export function pixelsToSvg(
  pixels: Pixel[],
  gridSize: number,
  options: SvgOptions = { mode: 'colorful' }
): string {
  const { mode, monoColor = 'currentColor', pixelSize = 1 } = options;
  const viewSize = gridSize * pixelSize;

  // Group pixels by row for horizontal merging
  const rowMap = new Map<number, Pixel[]>();
  for (const pixel of pixels) {
    const row = rowMap.get(pixel.y) || [];
    row.push(pixel);
    rowMap.set(pixel.y, row);
  }

  const rects: string[] = [];

  for (const [y, rowPixels] of rowMap) {
    // Sort by x
    const sorted = rowPixels.sort((a, b) => a.x - b.x);

    // Merge consecutive horizontal pixels of same color AND same opacity
    let i = 0;
    while (i < sorted.length) {
      const start = sorted[i];
      const color = mode === 'monochrome' ? monoColor : start.color;
      const startOpacity = start.opacity ?? 1;
      let width = 1;

      while (
        i + width < sorted.length &&
        sorted[i + width].x === start.x + width &&
        (mode === 'monochrome' || sorted[i + width].color === start.color) &&
        (sorted[i + width].opacity ?? 1) === startOpacity
      ) {
        width++;
      }

      // Build the opacity attribute only when needed
      const opacityAttr =
        startOpacity < 1 ? ` fill-opacity="${startOpacity}"` : '';

      rects.push(
        `  <rect x="${start.x * pixelSize}" y="${y * pixelSize}" width="${width * pixelSize}" height="${pixelSize}" fill="${color}"${opacityAttr}/>`
      );

      i += width;
    }
  }

  const xmlDecl = options.xmlDeclaration
    ? '<?xml version="1.0" encoding="UTF-8"?>\n'
    : '';

  return `${xmlDecl}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" fill="none">
${rects.join('\n')}
</svg>`;
}
