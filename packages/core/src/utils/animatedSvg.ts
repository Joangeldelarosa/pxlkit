import type { AnimatedPxlKitData, Pixel } from '../types';
import { gridToPixels } from './gridToPixels';

/**
 * Generate a standalone animated SVG string from an AnimatedPxlKitData.
 *
 * Uses CSS keyframes with `steps(1)` to toggle frame visibility in sequence.
 * This produces a lightweight, hardware-accelerated animation that works
 * in all modern browsers — no JavaScript required.
 *
 * @param icon - The animated icon data
 * @param options - Optional rendering options
 * @returns A complete SVG string with embedded CSS animation
 */
export function generateAnimatedSvg(
  icon: AnimatedPxlKitData,
  options?: {
    colorful?: boolean;
    monoColor?: string;
    pixelSize?: number;
    xmlDeclaration?: boolean;
  }
): string {
  const {
    colorful = true,
    monoColor = 'currentColor',
    pixelSize = 1,
    xmlDeclaration = false,
  } = options ?? {};

  const frameCount = icon.frames.length;
  if (frameCount === 0) return '';

  const totalDuration = frameCount * icon.frameDuration;
  const viewSize = icon.size * pixelSize;
  const framePercent = (100 / frameCount).toFixed(4);

  // Generate CSS
  const keyframes = `@keyframes pxf{0%{opacity:1}${framePercent}%{opacity:0}100%{opacity:0}}`;
  const frameStyles = icon.frames
    .map(
      (_, i) =>
        `.f${i}{opacity:0;animation:pxf ${totalDuration}ms steps(1) ${
          i * icon.frameDuration
        }ms ${icon.loop ? 'infinite' : '1'} both}`
    )
    .join('');

  const css = `<style>${keyframes}${frameStyles}</style>`;

  // Generate frame groups
  const groups = icon.frames
    .map((frame, i) => {
      const mergedPalette = frame.palette
        ? { ...icon.palette, ...frame.palette }
        : icon.palette;

      // Build a temporary PxlKitData to use gridToPixels
      const tempIcon = {
        name: icon.name,
        size: icon.size,
        category: icon.category,
        grid: frame.grid,
        palette: mergedPalette,
        tags: [],
      };

      const pixels = gridToPixels(tempIcon);
      const rects = mergePixelsToRects(pixels, colorful, monoColor, pixelSize);
      return `<g class="f${i}">${rects}</g>`;
    })
    .join('');

  const xmlDecl = xmlDeclaration
    ? '<?xml version="1.0" encoding="UTF-8"?>\n'
    : '';

  return `${xmlDecl}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges">${css}${groups}</svg>`;
}

/**
 * Merge consecutive same-color pixels into wider rects for smaller SVG output.
 */
function mergePixelsToRects(
  pixels: Pixel[],
  colorful: boolean,
  monoColor: string,
  pixelSize: number
): string {
  // Group by row
  const rowMap = new Map<number, Pixel[]>();
  for (const p of pixels) {
    const row = rowMap.get(p.y) || [];
    row.push(p);
    rowMap.set(p.y, row);
  }

  const parts: string[] = [];

  for (const [y, rowPixels] of rowMap) {
    const sorted = rowPixels.sort((a, b) => a.x - b.x);
    let i = 0;

    while (i < sorted.length) {
      const start = sorted[i];
      const fill = colorful ? start.color : monoColor;
      const startOpacity = start.opacity ?? 1;
      let width = 1;

      while (
        i + width < sorted.length &&
        sorted[i + width].x === start.x + width &&
        (!colorful || sorted[i + width].color === start.color) &&
        (sorted[i + width].opacity ?? 1) === startOpacity
      ) {
        width++;
      }

      const opAttr =
        startOpacity < 1 ? ` fill-opacity="${startOpacity.toFixed(3)}"` : '';
      parts.push(
        `<rect x="${start.x * pixelSize}" y="${y * pixelSize}" width="${
          width * pixelSize
        }" height="${pixelSize}" fill="${fill}"${opAttr}/>`
      );

      i += width;
    }
  }

  return parts.join('');
}

/**
 * Convert an AnimatedPxlKitData into an array of static PxlKitData
 * (one per frame). Useful for frame-by-frame editing or preview.
 */
export function animatedToFrameIcons(
  icon: AnimatedPxlKitData
): Array<{
  name: string;
  size: number;
  category: string;
  grid: string[];
  palette: Record<string, string>;
  tags: string[];
}> {
  return icon.frames.map((frame, i) => ({
    name: `${icon.name}-frame-${i}`,
    size: icon.size,
    category: icon.category,
    grid: frame.grid,
    palette: frame.palette
      ? { ...icon.palette, ...frame.palette }
      : { ...icon.palette },
    tags: icon.tags,
  }));
}
