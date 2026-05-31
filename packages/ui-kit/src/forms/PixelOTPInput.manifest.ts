import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import {
  Default,
  Numeric4,
  Alphanumeric,
  Masked,
  WithSeparator,
} from './PixelOTPInput.examples'

export default defineManifest({
  name: 'PixelOTPInput',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'One-time passcode input with auto-advance, paste-fill, and per-cell keyboard navigation.',
  highlights: [
    'Configurable length and numeric or alphanumeric input mode',
    'Auto-advance on entry and backspace-to-previous behavior',
    'Paste support distributes characters across cells',
    'Optional mask mode and custom separator between cells',
    'Controlled or uncontrolled via value / defaultValue',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'numeric-4', label: '4-digit Numeric', Component: Numeric4 },
    { id: 'alphanumeric', label: 'Alphanumeric', Component: Alphanumeric },
    { id: 'masked', label: 'Masked', Component: Masked },
    { id: 'with-separator', label: 'With Separator', Component: WithSeparator },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role="group" with aria-label for the cell collection',
      'per-cell aria-label indicating digit index and total',
      'inputmode=numeric|text matches the accepted character set',
      'autocomplete="one-time-code" on the first cell for SMS autofill',
    ],
    keyboard: [
      { key: 'ArrowLeft', does: 'Focus previous cell' },
      { key: 'ArrowRight', does: 'Focus next cell' },
      { key: 'Home', does: 'Focus first cell' },
      { key: 'End', does: 'Focus last cell' },
      { key: 'Backspace', does: 'Clear current cell, or move back and clear previous if empty' },
      { key: 'Paste', does: 'Distribute sanitized characters across remaining cells' },
    ],
    notes:
      'Invalid characters are silently rejected based on the type prop. onComplete fires once when all cells are filled.',
  },
  related: ['PixelInput', 'PixelPasswordInput'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
