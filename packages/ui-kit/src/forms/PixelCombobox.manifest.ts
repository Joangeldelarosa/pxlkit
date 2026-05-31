import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCombobox } from './PixelCombobox';
import {
  Controlled,
  CustomEmptyMessage,
  Default,
  Disabled,
  Grouped,
  NotSearchable,
  Sizes,
  Surfaces,
  Uncontrolled,
  WithError,
  WithFormName,
} from './PixelCombobox.examples';

void PixelCombobox;

export default defineManifest({
  name: 'PixelCombobox',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'Searchable single-value combobox built on a button trigger + listbox popover with type-to-filter, optional grouping, and full keyboard navigation.',
  highlights: [
    'WAI-ARIA combobox pattern — `role="combobox"` trigger paired with a `role="listbox"` popup and `aria-activedescendant` for highlight tracking.',
    'Type-to-filter search input is opt-out (`searchable={false}`) for short lists where filtering adds friction.',
    'Optional `group` field on options renders sticky group headings in the listbox without breaking keyboard navigation.',
    'Controlled or uncontrolled — `value` + `onChange` or `defaultValue`; integrates with native forms via hidden `name` input.',
    'Tone-free surface theming (pixel/linear) and shared size scale (sm/md/lg) match the rest of the input family.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'grouped', label: 'Grouped options', Component: Grouped },
    { id: 'not-searchable', label: 'Without search', Component: NotSearchable },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'with-error', label: 'With error', Component: WithError },
    { id: 'with-form-name', label: 'With form name', Component: WithFormName },
    { id: 'custom-empty-message', label: 'Custom empty message', Component: CustomEmptyMessage },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['combobox', 'listbox'],
    keyboard: [
      { key: 'ArrowDown', does: 'Opens the listbox when closed; moves highlight to the next option when open.' },
      { key: 'ArrowUp', does: 'Opens the listbox when closed; moves highlight to the previous option when open.' },
      { key: 'Home', does: 'Highlights the first option in the filtered list.' },
      { key: 'End', does: 'Highlights the last option in the filtered list.' },
      { key: 'Enter', does: 'Commits the highlighted option and closes the listbox.' },
      { key: 'Escape', does: 'Closes the listbox without changing the selection.' },
    ],
    notes:
      'Trigger is a `<button role="combobox">` with `aria-haspopup="listbox"`, `aria-expanded`, and `aria-activedescendant` wired to the highlighted option id. When searchable, an inner `role="searchbox"` input proxies keyboard navigation to the listbox. Provide an accessible name via `label`; `error` automatically sets `aria-invalid`.',
  },
  related: ['PixelSelect', 'PixelMultiSelect', 'PixelDropdown'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
