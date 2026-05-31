import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelMultiSelect } from './PixelMultiSelect';
import { Default, Searchable, WithMax } from './PixelMultiSelect.examples';

export default defineManifest({
  name: 'PixelMultiSelect',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'Multi-select combobox with chip-based selected values, optional search, and max-selection cap.',
  highlights: [
    'Combobox + listbox with aria-multiselectable',
    'Chip rendering for selected values with keyboard removal (Backspace)',
    'Optional searchable filter and clearable affordance',
    'Max-selection cap with live count footer',
    'Surface-aware (flat/linear) field shell with hint/error states',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'searchable', label: 'Searchable + Clearable', Component: Searchable },
    { id: 'with-max', label: 'With Max', Component: WithMax },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['combobox', 'listbox', 'multiselectable'],
    keyboard: [
      { key: 'ArrowDown', does: 'Open popover or move highlight down' },
      { key: 'ArrowUp', does: 'Open popover or move highlight up' },
      { key: 'Home', does: 'Highlight first option' },
      { key: 'End', does: 'Highlight last option' },
      { key: 'Enter / Space', does: 'Toggle highlighted option' },
      { key: 'Backspace', does: 'Remove last selected chip when query is empty' },
    ],
    notes:
      'Trigger uses role=combobox with aria-controls/expanded/activedescendant. Listbox advertises aria-multiselectable. Chip remove targets carry aria-label for the screen reader.',
  },
  related: ['PixelSelect', 'PixelCombobox', 'PixelTagInput'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
