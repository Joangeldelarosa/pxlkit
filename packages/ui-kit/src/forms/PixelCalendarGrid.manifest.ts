import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import {
  Default,
  WithSelectedDate,
  WithMinMax,
  WithDisabledWeekends,
  RangePreview,
} from './PixelCalendarGrid.examples'

export default defineManifest({
  name: 'PixelCalendarGrid',
  category: 'forms',
  since: '1.9.0',
  status: 'stable',
  description:
    'Standalone month grid for date selection — usable inline or composed inside date pickers and range pickers.',
  highlights: [
    'Controlled or uncontrolled month navigation: `month` + `onMonthChange` (React), `v-model:month` (Vue), `[(month)]` (Angular)',
    'Min/max date bounds plus custom disabledDates (array or predicate)',
    'Optional rangePreview prop highlights start/end + in-range cells',
    'Full keyboard nav: Arrows, Home/End, PageUp/PageDown, Enter/Space',
    'Surface-aware (pixel / linear) — follows the nearest PxlKitSurfaceProvider',
  ],
  examples: [
    {
      id: 'default',
      label: 'Default',
      description:
        'Shows the current month and marks today, by the clock of whatever renders it: a server render can differ from the browser\'s (a page built on another day, another time zone) and fail to hydrate. For a stable server render pass month (and value or defaultValue), or render a current-month calendar in the browser only: next/dynamic with ssr: false (Next.js), ClientOnly (Nuxt), @defer (Angular).',
      Component: Default,
    },
    { id: 'with-selected-date', label: 'With Selected Date', Component: WithSelectedDate },
    { id: 'with-min-max', label: 'With Min/Max Bounds', Component: WithMinMax },
    { id: 'with-disabled-weekends', label: 'Disabled Weekends', Component: WithDisabledWeekends },
    { id: 'range-preview', label: 'Range Preview', Component: RangePreview },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['grid'],
    keyboard: [
      { key: 'ArrowLeft', does: 'Move focus to previous day' },
      { key: 'ArrowRight', does: 'Move focus to next day' },
      { key: 'ArrowUp', does: 'Move focus to previous week' },
      { key: 'ArrowDown', does: 'Move focus to next week' },
      { key: 'Home', does: 'Move focus to start of week' },
      { key: 'End', does: 'Move focus to end of week' },
      { key: 'PageUp', does: 'Move focus to the same day of the previous month (its last day when shorter)' },
      { key: 'PageDown', does: 'Move focus to the same day of the next month (its last day when shorter)' },
      { key: 'Shift+PageUp', does: 'Move focus to the same day of the previous year' },
      { key: 'Shift+PageDown', does: 'Move focus to the same day of the next year' },
      { key: 'Enter', does: 'Select the focused day' },
      { key: 'Space', does: 'Select the focused day' },
    ],
    notes:
      'role=grid with columnheader weekday cells and gridcell day buttons; aria-selected marks the chosen day, aria-current="date" marks today, and aria-disabled marks out-of-bounds or disabled dates. Moves skip disabled days and stop at min/max. One enabled day is in the tab order. Week start, month and weekday names follow PxlKitLocaleProvider.',
  },
  related: ['PixelDatePicker', 'PixelDateRangePicker'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
