import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelChipGroup } from './PixelChipGroup';
import { Default, MultiSelect, Surfaces } from './PixelChipGroup.examples';

void PixelChipGroup;

export default defineManifest({
  name: 'PixelChipGroup',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Controlled chip row with single-select (radiogroup) or multi-select (group of checkboxes) — wraps each PixelChip in a semantic toggle button.',
  highlights: [
    'Controlled value/onChange API drives selection — chips stay presentational.',
    'Single mode renders role=radiogroup with roving tabindex + arrow / Home / End navigation.',
    'Multi mode renders role=checkbox per chip with aria-checked and Space/Enter toggle.',
    'Surface-aware: forwards pixel or linear surface to chip wrappers for consistent borders.',
    'aria-label / aria-labelledby make the group an accessible landmark.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'multi-select', label: 'Multi Select', Component: MultiSelect },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['radiogroup', 'checkbox-group'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into / out of the group; in single mode only the selected (or first) chip is tab-reachable.' },
      { key: 'Space', does: 'Toggles the focused chip.' },
      { key: 'Enter', does: 'Toggles the focused chip.' },
      { key: 'ArrowRight', does: 'Moves focus to the next chip and selects it.', when: 'single mode (radiogroup)' },
      { key: 'ArrowLeft', does: 'Moves focus to the previous chip and selects it.', when: 'single mode (radiogroup)' },
      { key: 'ArrowDown', does: 'Moves focus to the next chip and selects it.', when: 'single mode (radiogroup)' },
      { key: 'ArrowUp', does: 'Moves focus to the previous chip and selects it.', when: 'single mode (radiogroup)' },
      { key: 'Home', does: 'Focuses and selects the first chip.', when: 'single mode (radiogroup)' },
      { key: 'End', does: 'Focuses and selects the last chip.', when: 'single mode (radiogroup)' },
    ],
    notes:
      'Each child chip must declare a string `value` prop. In single (radiogroup) mode an accessible name (aria-label or aria-labelledby) is required so screen readers announce the group; multi mode renders a bare div unless a name is provided. The wrapping button owns role/aria-checked/tabindex; the PixelChip child remains purely visual.',
  },
  related: ['PixelChip', 'PixelBadgeGroup', 'PixelBadge'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
