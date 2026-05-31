import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelRadioGroup } from '../inputs';
import {
  Controlled,
  Default,
  Disabled,
  Required,
  Surfaces,
  Tones,
  WithFormName,
} from './PixelRadioGroup.examples';

export default defineManifest({
  name: 'PixelRadioGroup',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Single-select grouped radios with a pixel dot indicator, fieldset/legend semantics, and tone + surface variants.',
  highlights: [
    'Controlled via value + onChange(next: string) over a list of options.',
    'Renders as a real <fieldset> with role="radiogroup" and a <legend> from label.',
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
      { key: 'Tab', does: 'Moves focus into the radio group and on to the next focusable element after the last option.' },
      { key: 'Space', does: 'Activates the focused radio option (native <button> behavior).' },
      { key: 'Enter', does: 'Activates the focused radio option (native <button> behavior).' },
    ],
    notes:
      'Wrapped in a <fieldset role="radiogroup"> with <legend> derived from label and aria-disabled / aria-required mirroring the props. Each option is a <button role="radio"> with aria-checked reflecting selection. When name is set a hidden <input> mirrors the current value so the group participates in native <form> submissions.',
  },
  related: ['PixelCheckbox', 'PixelSegmented', 'PixelToggleGroup'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
