/**
 * Element hosts of the carousel and the tables (data) → the root tag React
 * renders. The charts are attribute selectors on their `<svg>`.
 */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-carousel': 'div',
  'pxl-carousel-item': 'div',
  'pxl-data-table': 'div',
  'pxl-table': 'div',
};
