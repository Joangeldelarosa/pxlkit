/**
 * Element hosts of the forms pickers → the root tag React renders (`null`: a
 * component whose root is a field shell of its own).
 */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-calendar-grid': 'div',
  'pxl-date-picker': null,
  'pxl-date-range-picker': null,
  'pxl-combobox': null,
  'pxl-multi-select': null,
  'pxl-color-input': null,
};
