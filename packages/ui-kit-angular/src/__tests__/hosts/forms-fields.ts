/**
 * Element hosts of the forms field components → the root tag React renders
 * (`null`: a fragment, or a component whose root is a field shell of its own).
 */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-input': null,
  'pxl-input-group': 'div',
  'pxl-password-input': null,
  'pxl-textarea': null,
  'pxl-number-input': null,
  'pxl-checkbox': null,
  'pxl-segmented': 'div',
  'pxl-select': null,
};
