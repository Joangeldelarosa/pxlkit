/** Element hosts of the navigation components → the root tag React renders (`null`: none / a fragment). */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-tabs': 'div',
  'pxl-tabs-list': 'div',
  'pxl-tabs-panel': null,
  'pxl-accordion': 'div',
  'pxl-breadcrumb': 'nav',
  'pxl-menubar': 'div',
  'pxl-navigation-menu': 'nav',
  'pxl-pagination': 'nav',
  'pxl-sidebar': 'nav',
  'pxl-stepper': 'div',
  'pxl-stepper-step': null,
};
