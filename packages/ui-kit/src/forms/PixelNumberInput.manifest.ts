import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  WithPrefixSuffix,
  ThousandsSeparator,
  HideControls,
  WithError,
} from './PixelNumberInput.examples';

export default defineManifest({
  name: 'PixelNumberInput',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'Numeric input with spin controls, clamp behaviors, precision, prefix/suffix, and thousands-separator formatting.',
  highlights: [
    'Spinbutton with ArrowUp/ArrowDown step bumps and clickable increment/decrement controls',
    'Configurable clamp behavior (strict, on-blur, or none) with min/max bounds',
    'Precision rounding avoids floating-point artifacts (e.g. 0.1 + 0.2)',
    'Optional prefix, suffix, and thousands-separator with parse-aware display',
    'Surface/tone aware, controlled or uncontrolled via useControllableState',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-prefix-suffix', label: 'With Prefix & Suffix', Component: WithPrefixSuffix },
    { id: 'thousands-separator', label: 'Thousands Separator', Component: ThousandsSeparator },
    { id: 'hide-controls', label: 'Hide Controls', Component: HideControls },
    { id: 'with-error', label: 'With Error', Component: WithError },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['spinbutton'],
    keyboard: [
      { key: 'ArrowUp', does: 'Increment value by step' },
      { key: 'ArrowDown', does: 'Decrement value by step' },
    ],
    notes:
      'Renders role="spinbutton" with aria-valuemin/aria-valuemax/aria-valuenow reflecting the current numeric state. Error state sets aria-invalid.',
  },
  related: ['PixelInput', 'PixelSlider'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
