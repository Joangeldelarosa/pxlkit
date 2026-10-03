import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithPresets, SingleMonth } from './PixelDateRangePicker.examples';

export default defineManifest({
  name: 'PixelDateRangePicker',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Accessible date range picker with one or two-month grid, hover preview, presets, and min/max constraints.',
  highlights: [
    'Controlled and uncontrolled usage via value/defaultValue + onChange',
    'One or two-month calendar with hover preview while picking',
    'Auto-swap of from/to when the second pick precedes the first',
    'Optional quick-select presets and clearable trigger',
    'Surface-aware styling with FieldShell label/hint/error wiring',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-presets', label: 'With Presets', Component: WithPresets },
    { id: 'single-month', label: 'Single Month', Component: SingleMonth },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'two-month grid (role=grid)',
      'aria-label on day cells',
      'start/end announced',
      'presets keyboard-reachable',
      'clear button beside the trigger',
    ],
    keyboard: [
      { key: 'ArrowLeft', does: 'Move focus to the previous day' },
      { key: 'ArrowRight', does: 'Move focus to the next day' },
      { key: 'ArrowUp', does: 'Move focus to the previous week' },
      { key: 'ArrowDown', does: 'Move focus to the next week' },
      { key: 'Home', does: 'Move focus to the first day of the week' },
      { key: 'End', does: 'Move focus to the last day of the week' },
      { key: 'PageUp', does: 'Move focus to the same day of the previous month (its last day when shorter)' },
      { key: 'PageDown', does: 'Move focus to the same day of the next month (its last day when shorter)' },
      { key: 'Shift+PageUp', does: 'Move focus to the same day of the previous year' },
      { key: 'Shift+PageDown', does: 'Move focus to the same day of the next year' },
      { key: 'Enter', does: 'Select the focused day (start, then end)' },
      { key: 'Space', does: 'Select the focused day (start, then end)' },
      { key: 'Tab', does: 'Move from the trigger to its clear button while a range is set', when: 'clearable' },
      { key: 'Enter / Space', does: 'Clear the range and focus the trigger, without opening the popover', when: 'clear button focused' },
    ],
    notes:
      'Opening moves focus to the range start, else today; Escape, a preset and picking the end return it to the trigger. The popover is a dialog named "Choose date range". Each calendar panel uses role=grid with a labelled aria-live month header; day cells expose aria-selected for range edges, aria-current="date" for today and aria-disabled for out-of-bound days, and one day of the two months is in the tab order. Presets render as native buttons reachable via Tab. With clearable and a range set, a native "Clear range" button lies over the end of the trigger, beside it rather than inside (a button cannot contain a button): it is the next tab stop, clears the range, closes an open popover and moves focus to the trigger.',
  },
  related: ['PixelDatePicker', 'PixelCalendarGrid', 'PixelPopover'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
