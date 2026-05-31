import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSlider } from '../inputs';
import {
  Default,
  Range,
  Tones,
  Surfaces,
  WithMinMax,
  WithMarks,
  WithTicks,
  WithTooltip,
  TooltipOnDrag,
  Disabled,
  Required,
  RangeWithMarks,
} from './PixelSlider.examples';

export default defineManifest({
  name: 'PixelSlider',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Controlled single- or range-thumb slider with optional marks, tick grid, and per-thumb tooltips.',
  highlights: [
    'Single (value: number) and range (value: [number, number]) modes share one component',
    'Seven tones via the shared toneMap palette; pixel and linear surfaces',
    'Optional labeled marks and step-aligned tick grid under the track',
    'Per-thumb tooltips with always / drag / never visibility modes',
    'Full keyboard support: arrows, Home, End, PageUp, PageDown',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'range', label: 'Range', Component: Range },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-min-max', label: 'With min/max', Component: WithMinMax },
    { id: 'with-marks', label: 'With marks', Component: WithMarks },
    { id: 'with-ticks', label: 'With ticks', Component: WithTicks },
    { id: 'with-tooltip', label: 'Always tooltip', Component: WithTooltip },
    { id: 'tooltip-on-drag', label: 'Tooltip on drag', Component: TooltipOnDrag },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'required', label: 'Required', Component: Required },
    { id: 'range-with-marks', label: 'Range with marks', Component: RangeWithMarks },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['slider'],
    keyboard: [
      { key: 'ArrowRight / ArrowUp', does: 'Increment the focused thumb by step.' },
      { key: 'ArrowLeft / ArrowDown', does: 'Decrement the focused thumb by step.' },
      { key: 'Home', does: 'Jump the focused thumb to min.' },
      { key: 'End', does: 'Jump the focused thumb to max.' },
      { key: 'PageUp', does: 'Increment the focused thumb by step * 10.' },
      { key: 'PageDown', does: 'Decrement the focused thumb by step * 10.' },
      { key: 'Tab', does: 'Move focus to the next thumb or focusable element.' },
    ],
    notes:
      'Each thumb is rendered with role="slider" and exposes aria-valuemin, aria-valuemax, aria-valuenow, and an accessible label derived from the label prop. In range mode the lower thumb is constrained ≤ upper thumb on every change. Pointer interaction uses setPointerCapture so dragging tracks the cursor even when it leaves the track.',
  },
  related: ['PixelNumberInput', 'PixelProgress'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
