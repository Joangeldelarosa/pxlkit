import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Checked,
  Default,
  Disabled,
  Surfaces,
  Tones,
  WithFormName,
} from './PixelSwitch.examples';

export default defineManifest({
  name: 'PixelSwitch',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Two-state toggle switch with a sliding pixel thumb — flips a boolean setting on or off.',
  highlights: [
    'Controlled boolean via `checked` + `onChange(next)`.',
    'Tone and surface follow the kit-wide tokens (`pixel` keeps square corners, `linear` rounds the track).',
    'Optional `name`/`value`/`required` mirror the state into a hidden input for native form submission.',
    'Accessible: renders as `role="switch"` with `aria-checked`, `aria-disabled`, and `aria-required`.',
    'SSR-safe and tree-shakable; no portals or browser-only APIs.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'checked', label: 'Checked', Component: Checked },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'with-form-name', label: 'With Form Name', Component: WithFormName },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['switch'],
    keyboard: [
      { key: 'Tab', does: 'Move focus to / away from the switch.' },
      { key: 'Space', does: 'Toggle the checked state.' },
      { key: 'Enter', does: 'Toggle the checked state (native button activation).' },
    ],
    notes:
      'Uses `role="switch"` with `aria-checked` reflecting the boolean state. When `disabled`, the control is both visually dimmed and functionally inert (`disabled` + `aria-disabled`). The hidden mirror input only renders while `checked` is true so unchecked switches submit as absent (standard HTML form semantics).',
  },
  related: ['PixelCheckbox', 'PixelToggle'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
