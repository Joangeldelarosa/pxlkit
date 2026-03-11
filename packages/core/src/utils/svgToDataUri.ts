/**
 * Converts an SVG string to a data URI for inline use.
 *
 * @param svg - SVG markup string
 * @returns Data URI string
 */
export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Converts an SVG string to a base64 data URI.
 *
 * @param svg - SVG markup string
 * @returns Base64 data URI string
 */
export function svgToBase64(svg: string): string {
  if (typeof btoa === 'function') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  // Node.js fallback
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
