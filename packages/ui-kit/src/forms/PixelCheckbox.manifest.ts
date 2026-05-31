import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCheckbox } from '../inputs';
import {
  Default,
  Checked,
  Tones,
  Surfaces,
  Disabled,
  Required,
  WithFormName,
  Group,
} from './PixelCheckbox.examples';

export default defineManifest({
  name: 'PixelCheckbox',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Controlled boolean checkbox with a chunky pixel check mark, tone-aware fill, and optional form serialization.',
  highlights: [
    'Fully controlled via checked + onChange(next: boolean)',
    'Seven tones via the shared toneMap palette',
    'Pixel and linear surface variants share the same API',
    'Hidden mirror input lets it participate in native <form> submissions when name is set',
    'Renders as role="checkbox" with aria-checked, aria-disabled, and aria-required',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'checked', label: 'Checked', Component: Checked },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'required', label: 'Required', Component: Required },
    { id: 'with-form-name', label: 'With form name', Component: WithFormName },
    { id: 'group', label: 'Group', Component: Group },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['checkbox'],
    keyboard: [
      { key: 'Space', does: 'Toggles the checkbox between checked and unchecked.' },
      { key: 'Enter', does: 'Submits the enclosing form (native <button type="button"> behavior is keyboard-activated via Space; Enter falls back to form submission).' },
      { key: 'Tab', does: 'Moves focus to the next focusable element in the tab order.' },
    ],
    notes:
      'Rendered as a <button type="button"> with role="checkbox" and aria-checked reflecting the boolean state. aria-disabled and aria-required mirror the disabled and required props. When a name prop is supplied a hidden <input> is emitted alongside so the value participates in native <form> submissions only while checked.',
  },
  related: ['PixelRadioGroup', 'PixelSwitch', 'PixelToggle'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
