/** Element hosts of the feedback components → the root tag React renders (`null`: a fragment). */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-alert': 'div',
  'pxl-empty-state': 'div',
  'pxl-progress': 'div',
  'pxl-skeleton': 'div',
  'pxl-spinner': 'span',
  'pxl-toast-card': 'div',
  'pxl-toast-provider': null,
};
