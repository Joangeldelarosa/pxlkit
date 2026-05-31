import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Controlled,
  Default,
  Disabled,
  Required,
  Sizes,
  Surfaces,
  Tones,
  Uncontrolled,
  WithError,
  WithFormName,
} from './PixelSelect.examples';

export default defineManifest({
  name: 'PixelSelect',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Custom single-value dropdown built on a button + listbox (no native `<select>`) with full keyboard navigation and tone/size/surface theming.',
  highlights: [
    'WAI-ARIA combobox + listbox semantics — `aria-expanded`, `aria-haspopup`, `aria-selected` wired to the trigger and options.',
    'Full keyboard support: ArrowUp/Down, Home/End, Enter/Space to select, Escape to close, Tab to dismiss.',
    'Controlled or uncontrolled — `value` + `onChange` or `defaultValue`; emits the selected option value as a string.',
    'Form-friendly — hidden mirror input lets the value participate in native `<form>` submissions via `name`.',
    'Tone, size, and surface (pixel/linear) variants share the same primitives as the rest of the input family.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'with-error', label: 'With error', Component: WithError },
    { id: 'required', label: 'Required', Component: Required },
    { id: 'with-form-name', label: 'With form name', Component: WithFormName },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['combobox', 'listbox'],
    keyboard: [
      { key: 'Enter', does: 'Opens the listbox, or selects the highlighted option when open.' },
      { key: 'Space', does: 'Opens the listbox, or selects the highlighted option when open.' },
      { key: 'ArrowDown', does: 'Opens the listbox or moves highlight to the next option.' },
      { key: 'ArrowUp', does: 'Moves highlight to the previous option.' },
      { key: 'Home', does: 'Highlights the first option (opening the listbox if needed).' },
      { key: 'End', does: 'Highlights the last option (opening the listbox if needed).' },
      { key: 'Escape', does: 'Closes the listbox without changing the selection.' },
      { key: 'Tab', does: 'Closes the listbox and moves focus to the next focusable element.' },
    ],
    notes:
      'Trigger is a `<button role="combobox">` paired with a `role="listbox"` popup containing `role="option"` children. Provide an accessible name via `label` or `aria-describedby`; `error` automatically sets `aria-invalid`.',
  },
  related: ['PixelCombobox', 'PixelMultiSelect', 'PixelDropdown'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
