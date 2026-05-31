import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithPresets, WithMinMax } from './PixelDatePicker.examples';

export default defineManifest({
  name: 'PixelDatePicker',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'Accessible date input with popover calendar grid, keyboard navigation, presets, and min/max constraints.',
  highlights: [
    'Controlled and uncontrolled usage via value/defaultValue + onChange',
    'Popover calendar with roving tabindex and full keyboard navigation',
    'Min/max bounds plus disabledDates (array or predicate)',
    'Optional quick-select presets and clearable trigger',
    'Surface-aware styling with FieldShell label/hint/error wiring',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-presets', label: 'With Presets', Component: WithPresets },
    { id: 'with-min-max', label: 'With Min/Max', Component: WithMinMax },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['input + popover calendar (role=grid)', 'aria-label on day cells', 'min/max enforced'],
    keyboard: [
      { key: 'ArrowLeft', does: 'Move focus to the previous day' },
      { key: 'ArrowRight', does: 'Move focus to the next day' },
      { key: 'ArrowUp', does: 'Move focus to the previous week' },
      { key: 'ArrowDown', does: 'Move focus to the next week' },
      { key: 'Home', does: 'Move focus to the first day of the week' },
      { key: 'End', does: 'Move focus to the last day of the week' },
      { key: 'PageUp', does: 'Move focus to the previous month' },
      { key: 'PageDown', does: 'Move focus to the next month' },
      { key: 'Enter', does: 'Select the focused day and close the popover' },
      { key: 'Space', does: 'Select the focused day and close the popover' },
    ],
    notes:
      'Day cells expose aria-selected and aria-disabled; the calendar grid uses role=grid with explicit role=row wrappers and an aria-live month label.',
  },
  related: ['PixelInput', 'PixelPopover', 'PixelSelect'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
