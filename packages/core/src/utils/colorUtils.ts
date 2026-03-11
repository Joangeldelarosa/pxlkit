/**
 * Adjusts the brightness of a hex color.
 * @param hex - Hex color string (e.g., "#FF0000")
 * @param amount - Amount to adjust (-255 to 255)
 */
export function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
}

/**
 * Converts a hex color to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

/**
 * Converts RGB components to a hex color string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
}

/**
 * Returns the perceived brightness of a color (0-255).
 * Uses the luminance formula for human perception.
 */
export function getPerceivedBrightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Classic retro palettes for the pixel editor
 */
export const RETRO_PALETTES = {
  nes: {
    name: 'NES',
    colors: [
      '#000000', '#FCFCFC', '#F8F8F8', '#BCBCBC',
      '#7C7C7C', '#A4E4FC', '#3CBCFC', '#0078F8',
      '#0000FC', '#B8B8F8', '#6888FC', '#0058F8',
      '#0000BC', '#D8B8F8', '#9878F8', '#6844FC',
      '#4428BC', '#F8B8F8', '#F878F8', '#D800CC',
      '#940084', '#F8A4C0', '#F85898', '#E40058',
      '#A80020', '#F0D0B0', '#F87858', '#F83800',
      '#A81000', '#FCE0A8', '#FCA044', '#E45C10',
      '#881400', '#F8D878', '#F8B800', '#AC7C00',
      '#503000', '#D8F878', '#B8F818', '#00B800',
      '#007800', '#B8F8B8', '#58D854', '#00A800',
      '#006800', '#B8F8D8', '#58F898', '#00A844',
      '#005800', '#00FCFC', '#00E8D8', '#008888',
      '#004058',
    ],
  },
  gameboy: {
    name: 'Game Boy',
    colors: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  },
  cga: {
    name: 'CGA',
    colors: [
      '#000000', '#555555', '#AAAAAA', '#FFFFFF',
      '#0000AA', '#5555FF', '#00AA00', '#55FF55',
      '#00AAAA', '#55FFFF', '#AA0000', '#FF5555',
      '#AA00AA', '#FF55FF', '#AA5500', '#FFFF55',
    ],
  },
  pico8: {
    name: 'PICO-8',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
    ],
  },
  sweetie16: {
    name: 'Sweetie 16',
    colors: [
      '#1A1C2C', '#5D275D', '#B13E53', '#EF7D57',
      '#FFCD75', '#A7F070', '#38B764', '#257179',
      '#29366F', '#3B5DC9', '#41A6F6', '#73EFF7',
      '#F4F4F4', '#94B0C2', '#566C86', '#333C57',
    ],
  },
} as const;

export type RetropaletteName = keyof typeof RETRO_PALETTES;
