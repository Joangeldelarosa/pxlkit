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
    patterns: ['combobox', 'listbox'],
    keyboard: [
      { key: 'Tab', does: "Move through the field: each chip's remove button, the combobox, then the clear button" },
      { key: 'ArrowDown', does: 'Open popover or move highlight down' },
      { key: 'ArrowUp', does: 'Open popover or move highlight up' },
      { key: 'Home', does: 'Highlight first option' },
      { key: 'End', does: 'Highlight last option' },
      { key: 'Enter', does: 'Toggle highlighted option' },
      { key: 'Space', does: 'Toggle highlighted option from the combobox; types a space in the search field' },
      { key: 'Backspace', does: 'Remove last selected chip when query is empty' },
      { key: 'Escape', does: 'Close the popover; from the search field, focus returns to the combobox', when: 'popover open' },
      { key: 'Enter / Space', does: "Remove the chip and focus the next chip's remove button, else the combobox", when: 'remove button focused' },
      { key: 'Enter / Space', does: 'Clear the selection and focus the combobox', when: 'clear button focused' },
    ],
    notes:
      'The field holds, side by side, the chips — each a label and a native button named after it ("Remove Apple") — the combobox and, when clearable, a native "Clear selection" button: a button cannot contain a button, so none sits inside another, and each is a tab stop in reading order. The combobox (role=combobox, named by the label) has aria-controls/expanded/activedescendant, and so does the search field while focus is in it; it reads the selected labels as its value. A remove or clear button that holds focus hands it on as it goes; under the pointer they leave focus where it is. A press elsewhere on the field opens or closes the listbox and focuses the combobox; the popover anchors to the field. The field shows the combobox\'s keyboard focus. Listbox advertises aria-multiselectable and marks the chosen options aria-selected.',
  },
  related: ['PixelSelect', 'PixelCombobox', 'PixelTagInput'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
