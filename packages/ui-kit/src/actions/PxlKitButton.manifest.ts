import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitButton } from '../actions';
import { Default, Tones, Sizes, Surfaces, Disabled } from './PxlKitButton.examples';

void PxlKitButton;

export default defineManifest({
  name: 'PxlKitButton',
  category: 'actions',
  since: '1.0.0',
  status: 'deprecated',
  deprecatedNote:
    'Renamed to PixelIconButton. The PxlKit* prefix is reserved for system primitives (providers); leaf components use the Pixel* prefix.',
  deprecatedReplacement: 'PixelIconButton',
  deprecatedRemovedIn: '3.0.0',
  description:
    'Deprecated alias for PixelIconButton — a square icon-only button with a required accessible label.',
  highlights: [
    'Identical runtime to PixelIconButton (re-exported as-is).',
    'Renders a square, icon-only button with required `label` exposed as aria-label and title.',
    'Supports tones, sizes, and pixel/linear surface aesthetics.',
    'Kept as an alias for backward compatibility; removal carried forward to v3.0.0 (see ADR-0004).',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the button.' },
      { key: 'Space', does: 'Activates the button.' },
    ],
    notes:
      'The `label` prop is required and is wired to both aria-label and title so screen reader and tooltip discovery stay in sync for an icon-only control.',
  },
  related: ['PixelIconButton', 'PixelButton', 'PixelSplitButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
