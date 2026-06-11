import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSegmented } from './PixelSegmented';
import {
  Controlled,
  Default,
  Disabled,
  Required,
  Surfaces,
  Tones,
  WithFormName,
} from './PixelSegmented.examples';

export default defineManifest({
  name: 'PixelSegmented',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Single-select segmented control for toggling between a small set of mutually exclusive options inline.',
  highlights: [
    'Controlled via value + onChange(next: string) over a list of options.',
    'Compact horizontal layout for 2-5 options that share visual real estate.',
    'Seven tones and pixel/linear surfaces share the kit-wide design tokens.',
    'Optional name emits a hidden input so it serializes inside native forms.',
    'disabled cascades to every option button (not just visually).',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'required', label: 'Required', Component: Required },
    { id: 'with-form-name', label: 'With form name', Component: WithFormName },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['radiogroup'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus to the next option button in the segmented control.' },
      { key: 'Space', does: 'Activates the focused option (native <button> behavior).' },
      { key: 'Enter', does: 'Activates the focused option (native <button> behavior).' },
    ],
    notes:
      'Each option renders as a <button> with aria-pressed reflecting the active selection, and aria-disabled mirroring the disabled prop. When name is set a hidden <input> mirrors the current value so the control participates in native <form> submissions. The implementation uses aria-pressed (toggle-button semantics) rather than role="radio" on each button.',
  },
  related: ['PixelRadioGroup', 'PixelToggleGroup', 'PixelTabs'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
