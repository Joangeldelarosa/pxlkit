/**
 * Element hosts of the forms control components → the root tag React renders
 * (`null`: a fragment, or a component whose root is a field shell of its own).
 */
export const HOST_TAGS: Readonly<Record<string, string | null>> = {
  'pxl-toggle-group': 'div',
  'pxl-slider': 'div',
  'pxl-otp-input': 'div',
  'pxl-file-upload': null,
  'pxl-form-item': 'div',
  'pxl-form-message': null,
};
