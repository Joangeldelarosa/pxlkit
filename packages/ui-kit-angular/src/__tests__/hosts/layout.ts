/** Element hosts of the layout components → the root tag React renders (`null`: a fragment). */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-bento': 'div',
  'pxl-bento-cell': 'div',
  'pxl-divider': null,
  'pxl-scroll-area': 'div',
  'pxl-section': 'section',
  'pxl-section-header': 'header',
};
