import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelToggle } from './PixelToggle';
import {
  Default,
  Pressed,
  Surfaces,
  Disabled,
} from './PixelToggle.examples';

export default defineManifest({
  name: 'PixelToggle',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Two-state toggle button with aria-pressed semantics. Works standalone or as a child of PixelToggleGroup for single/multi-select toolbars.',
  highlights: [
    'Standalone controlled (pressed + onPressedChange) or composed inside PixelToggleGroup',
    'Inherits size, variant, and surface from a parent PixelToggleGroup context',
    'Cyan tone pressed state with surface-aware borders, radius, and transitions',
    'Renders as role="radio" with aria-checked inside a single-select group, aria-pressed otherwise',
    'Forwards refs and registers with the group for roving-tabindex keyboard navigation',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'pressed', label: 'Pressed', Component: Pressed },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Space', does: 'Toggles the pressed state (native button activation).' },
      { key: 'Enter', does: 'Toggles the pressed state (native button activation).' },
      {
        key: 'ArrowRight / ArrowDown',
        does: 'Moves focus to the next item.',
        when: 'Inside a PixelToggleGroup with rovingFocus enabled.',
      },
      {
        key: 'ArrowLeft / ArrowUp',
        does: 'Moves focus to the previous item.',
        when: 'Inside a PixelToggleGroup with rovingFocus enabled.',
      },
      {
        key: 'Home / End',
        does: 'Moves focus to the first or last item.',
        when: 'Inside a PixelToggleGroup with rovingFocus enabled.',
      },
    ],
    notes:
      'Standalone toggle exposes aria-pressed reflecting the boolean state. When wrapped by a single-select PixelToggleGroup the role is overridden to "radio" with aria-checked so screen readers announce "one of N" semantics. Data attributes data-state and data-pxl-toggle-value support styling and testing hooks.',
  },
  related: ['PixelToggleGroup', 'PixelSwitch', 'PixelCheckbox'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
