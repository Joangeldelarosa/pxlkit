import type { PxlKitData, Pixel } from '../types';

/**
 * Parses a hex color string and extracts the RGB color and opacity.
 * Supports #RGB, #RRGGBB, and #RRGGBBAA formats.
 *
 * @returns An object with the 6-digit hex color and opacity (0-1)
 */
export function parseHexColor(hex: string): { color: string; opacity: number } {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;

  if (h.length === 3) {
    // #RGB → #RRGGBB
    const expanded = h
      .split('')
      .map((c) => c + c)
      .join('');
    return { color: `#${expanded}`.toUpperCase(), opacity: 1 };
  }

  if (h.length === 6) {
    return { color: `#${h}`.toUpperCase(), opacity: 1 };
  }

  if (h.length === 8) {
    const rgb = h.slice(0, 6);
    const alpha = parseInt(h.slice(6, 8), 16) / 255;
    return {
      color: `#${rgb}`.toUpperCase(),
      opacity: Math.round(alpha * 1000) / 1000,
    };
  }

  // Fallback: return as-is
  return { color: hex.toUpperCase(), opacity: 1 };
}

/**
 * Converts a grid+palette icon definition into an array of pixel coordinates.
 *
 * This is the "AI-friendly" intermediate format — a flat list of
 * { x, y, color, opacity } objects representing every non-transparent pixel.
 *
 * Automatically extracts opacity from 8-digit hex colors (#RRGGBBAA).
 * Pixels with 0 opacity (fully transparent) are excluded.
 *
 * @param icon - The pixel icon data with grid and palette
 * @returns Array of pixels with absolute coordinates, resolved colors, and opacity
 *
 * @example
 * ```ts
 * const pixels = gridToPixels(trophyIcon);
 * // [{ x: 2, y: 1, color: '#FFD700', opacity: 1 }, ...]
 * // [{ x: 5, y: 3, color: '#00FF00', opacity: 0.502 }, ...] // from #00FF0080
 * ```
 */
export function gridToPixels(icon: PxlKitData): Pixel[] {
  const pixels: Pixel[] = [];

  // Pre-parse palette for performance
  const resolvedPalette: Record<string, { color: string; opacity: number }> = {};
  for (const [char, hex] of Object.entries(icon.palette)) {
    resolvedPalette[char] = parseHexColor(hex);
  }

  for (let y = 0; y < icon.grid.length; y++) {
    const row = icon.grid[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char !== '.') {
        const resolved = resolvedPalette[char];
        if (resolved && resolved.opacity > 0) {
          pixels.push({
            x,
            y,
            color: resolved.color,
            ...(resolved.opacity < 1 ? { opacity: resolved.opacity } : {}),
          });
        }
      }
    }
  }

  return pixels;
}

/**
 * Converts an array of pixels back into grid+palette format.
 *
 * Useful for importing from the coordinate-based format (e.g., AI output)
 * back into the canonical grid format.
 *
 * @param pixels - Array of pixel coordinates with colors
 * @param size - Grid size (8, 16, or 32)
 * @returns An object with grid rows and palette mapping
 */
/**
 * Encodes a color + opacity into a hex string.
 * Returns #RRGGBB if opacity is 1, or #RRGGBBAA if opacity < 1.
 */
export function encodeHexColor(color: string, opacity?: number): string {
  const hex = color.startsWith('#') ? color : `#${color}`;
  const normalizedHex = hex.toUpperCase();

  if (opacity === undefined || opacity >= 1) {
    return normalizedHex;
  }

  const alphaByte = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return `${normalizedHex}${alphaByte}`;
}

/**
 * Converts an array of pixels back into grid+palette format.
 *
 * Useful for importing from the coordinate-based format (e.g., AI output)
 * back into the canonical grid format.
 *
 * Opacity is encoded into the palette hex as #RRGGBBAA when < 1.
 * This means two pixels with the same RGB but different opacity will
 * get different palette entries.
 *
 * @param pixels - Array of pixel coordinates with colors and optional opacity
 * @param size - Grid size (8, 16, or 32)
 * @returns An object with grid rows and palette mapping
 */
export function pixelsToGrid(
  pixels: Pixel[],
  size: number
): { grid: string[]; palette: Record<string, string> } {
  // Build reverse palette: "color+opacity" → character key
  const colorKeyToChar: Record<string, string> = {};
  const palette: Record<string, string> = {};
  let nextChar = 65; // Start at 'A'

  for (const pixel of pixels) {
    const fullHex = encodeHexColor(pixel.color, pixel.opacity);
    if (!colorKeyToChar[fullHex]) {
      const char = String.fromCharCode(nextChar++);
      colorKeyToChar[fullHex] = char;
      palette[char] = fullHex;
    }
  }

  // Build grid
  const grid: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const pixel = pixels.find((p) => p.x === x && p.y === y);
      if (pixel) {
        const fullHex = encodeHexColor(pixel.color, pixel.opacity);
        row += colorKeyToChar[fullHex] || '.';
      } else {
        row += '.';
      }
    }
    grid.push(row);
  }

  return { grid, palette };
}
