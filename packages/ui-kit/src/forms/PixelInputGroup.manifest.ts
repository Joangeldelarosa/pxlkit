import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelInputGroup } from './PixelInputGroup';
import {
  Default,
  PhoneWithCountryCode,
  Sizes,
  Surfaces,
} from './PixelInputGroup.examples';

void PixelInputGroup;

export default defineManifest({
  name: 'PixelInputGroup',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Visually joins multiple form controls into a single shell — strips inner borders/radii from children and adds segment dividers, so combos like country-code + phone read as one field.',
  highlights: [
    'Composes any form children (input, button, select) into a single joined shell.',
    '`size` and `surface` props inherit the kit-wide design tokens.',
    'Accessible: applies `role="group"` only when an `aria-label`/`aria-labelledby` is provided.',
    'Dev-mode warning when a multi-child group is missing an accessible name.',
    'Preserves child `className` (consumer styles win over the join overrides).',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    {
      id: 'phone-with-country-code',
      label: 'Phone with Country Code',
      Component: PhoneWithCountryCode,
    },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['group'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus through the joined controls in order.' },
    ],
    notes:
      'Sets `role="group"` only when given an accessible name (`aria-label` / `aria-labelledby`). Decorative addons inside should use `aria-hidden`; child controls keep their own labels.',
  },
  related: ['PixelInput', 'PixelBareInput', 'PixelSelect', 'PixelButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
