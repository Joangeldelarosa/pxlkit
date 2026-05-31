import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelColorInput } from './PixelColorInput';
import {
  Default,
  RgbFormat,
  CustomPresets,
  WithError,
} from './PixelColorInput.examples';

void PixelColorInput;

export default defineManifest({
  name: 'PixelColorInput',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Color picker field with a hex text input, native color swatch, and a keyboard-navigable preset grid inside a popover.',
  highlights: [
    'Outputs hex, rgb(), or hsl() depending on the format prop',
    'Popover with native color input, hex draft field, and preset swatch grid',
    'Roving tabindex with 2-D arrow key navigation across presets',
    'Surface-aware styling for pixel and modern variants',
    'Controlled or uncontrolled via value / defaultValue',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'rgb-format', label: 'RGB format', Component: RgbFormat },
    { id: 'custom-presets', label: 'Custom presets', Component: CustomPresets },
    { id: 'with-error', label: 'With error', Component: WithError },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['popover-dialog', 'roving-tabindex', 'labelled-field'],
    keyboard: [
      { key: 'Enter / Space', does: 'Open the popover or select the focused swatch' },
      { key: 'ArrowRight / ArrowLeft', does: 'Move focus horizontally across swatches' },
      { key: 'ArrowDown / ArrowUp', does: 'Move focus vertically across the 8-column grid' },
      { key: 'Home / End', does: 'Jump to the first or last swatch' },
      { key: 'Escape', does: 'Close the popover' },
    ],
    notes:
      'Trigger exposes aria-label; swatches are role=button with the color value as aria-label and aria-pressed reflecting selection.',
  },
  related: ['PixelInput', 'PixelPopover', 'FieldShell'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
