import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Clearable,
  Controlled,
  Default,
  Disabled,
  Loading,
  Sizes,
  Surfaces,
  Tones,
  Uncontrolled,
  WithAddons,
  WithCharCount,
  WithError,
  WithPrefixSuffix,
} from './PixelInput.examples';

export default defineManifest({
  name: 'PixelInput',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Single-line text input with label, hint, error message, tone/size/surface variants, prefix/suffix slots, joinable addons, clearable button, char counter, and loading state.',
  highlights: [
    'Controlled or uncontrolled — works with `value`/`onChange` or `defaultValue`.',
    'Inside-shell `prefix`/`suffix` slots plus outside-shell `addonLeft`/`addonRight` for joined groups.',
    'Optional `clearable` × button, `loading` spinner, and `showCount` character counter.',
    '`tone`, `size`, and `surface` follow the kit-wide design tokens.',
    'Accessible: pairs `aria-invalid` + `aria-describedby` with hint/error text.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'prefix-suffix', label: 'Prefix & Suffix', Component: WithPrefixSuffix },
    { id: 'addons', label: 'Joined Addons', Component: WithAddons },
    { id: 'clearable', label: 'Clearable', Component: Clearable },
    { id: 'loading', label: 'Loading', Component: Loading },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'error', label: 'With Error', Component: WithError },
    { id: 'char-count', label: 'Character Count', Component: WithCharCount },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['textbox'],
    keyboard: [
      { key: 'Tab', does: 'Move focus into / out of the input.' },
      { key: 'Enter', does: 'Submit the surrounding form (native browser behavior).' },
    ],
    notes:
      'Sets `aria-invalid` when `error` is provided and links the hint/error text via `aria-describedby`. The clear button is `tabIndex={-1}` so keyboard users edit the value directly instead of tabbing through it.',
  },
  related: [
    'PixelPasswordInput',
    'PixelTextarea',
    'PixelBareInput',
    'PixelInputGroup',
    'PixelNumberInput',
  ],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
