import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelPasswordInput } from '../inputs';
import {
  Default,
  WithHint,
  WithError,
  Tones,
  Sizes,
  Surfaces,
  Disabled,
  CustomToggleLabels,
  Controlled,
  Uncontrolled,
} from './PixelPasswordInput.examples';

export default defineManifest({
  name: 'PixelPasswordInput',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Password text field with an inline show/hide toggle that swaps the input type between password and text.',
  highlights: [
    'Inline visibility toggle with localizable labels via toggleLabels',
    'Label, hint, and error slots wired through the shared FieldShell',
    'Tone, size, and surface variants matched to PixelInput',
    'Forwarded ref to the underlying <input> for form-library integration',
    'Toggle button reflects state via aria-pressed for assistive tech',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-hint', label: 'With hint', Component: WithHint },
    { id: 'with-error', label: 'With error', Component: WithError },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'custom-toggle-labels', label: 'Custom toggle labels', Component: CustomToggleLabels },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['textbox', 'button'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into the password field; the visibility toggle is intentionally skipped (tabIndex=-1) so keyboard flow stays on the text field.' },
      { key: 'Enter', does: 'Submits the enclosing form, matching native password input behavior.' },
    ],
    notes:
      'The visibility toggle is a real <button type="button"> with an aria-label that mirrors the current state, and exposes aria-pressed so screen readers announce whether the password is currently visible. The input sets aria-invalid when an error is present and FieldShell wires aria-describedby to the hint/error message.',
  },
  related: ['PixelInput', 'PixelOTPInput'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
