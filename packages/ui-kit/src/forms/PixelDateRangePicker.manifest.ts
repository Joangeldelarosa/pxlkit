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
    ],
    keyboard: [
      { key: 'ArrowLeft', does: 'Move focus to the previous day' },
      { key: 'ArrowRight', does: 'Move focus to the next day' },
      { key: 'ArrowUp', does: 'Move focus to the previous week' },
      { key: 'ArrowDown', does: 'Move focus to the next week' },
      { key: 'Home', does: 'Move focus to the first day of the week' },
      { key: 'End', does: 'Move focus to the last day of the week' },
      { key: 'PageUp', does: 'Move focus to the previous month' },
      { key: 'PageDown', does: 'Move focus to the next month' },
      { key: 'Enter', does: 'Select the focused day (start, then end)' },
      { key: 'Space', does: 'Select the focused day (start, then end)' },
    ],
    notes:
      'Each calendar panel uses role=grid with a labelled aria-live month header; day cells expose aria-selected for range edges and aria-disabled for out-of-bound days. Presets render as native buttons reachable via Tab.',
  },
  related: ['PixelDatePicker', 'PixelCalendarGrid', 'PixelPopover'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
