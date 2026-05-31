import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelToggleGroup } from './PixelToggleGroup';
import {
  Default,
  Multiple,
  Variants,
  Sizes,
  RovingFocus,
  Surfaces,
} from './PixelToggleGroup.examples';

void PixelToggleGroup;

export default defineManifest({
  name: 'PixelToggleGroup',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Grouped pressable toggles with single- or multi-select semantics, roving focus, and surface-aware styling.',
  highlights: [
    'Discriminated union API: type="single" → string value, type="multiple" → string[] value',
    'Optional roving tabindex with arrow-key navigation and Home/End support',
    'Single mode exposes radiogroup/radio semantics; multi mode uses aria-pressed buttons',
    'Surface-aware (pixel/linear) and supports soft, solid, outline, and ghost variants',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'multiple', label: 'Multiple', Component: Multiple },
    { id: 'variants', label: 'Variants', Component: Variants },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'roving-focus', label: 'Roving focus', Component: RovingFocus },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['radiogroup', 'toolbar', 'toggle button'],
    keyboard: [
      { key: 'ArrowRight / ArrowDown', does: 'Move focus to next item', when: 'rovingFocus' },
      { key: 'ArrowLeft / ArrowUp', does: 'Move focus to previous item', when: 'rovingFocus' },
      { key: 'Home', does: 'Move focus to first item', when: 'rovingFocus' },
      { key: 'End', does: 'Move focus to last item', when: 'rovingFocus' },
      { key: 'Space / Enter', does: 'Toggle the focused item' },
    ],
    notes:
      'Provide an aria-label (or aria-labelledby) for screen reader context. Single-select renders role="radiogroup" with role="radio" children; multi-select renders role="group" only when named.',
  },
  related: ['PixelToggle', 'PixelSegmentedControl', 'PixelCheckbox'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
