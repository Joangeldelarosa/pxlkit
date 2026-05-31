import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBareTextarea } from '../data-display';
import {
  Default,
  Uncontrolled,
  Controlled,
  Disabled,
  ReadOnly,
  WithCustomStyling,
  WithMaxLength,
  Required,
} from './PixelBareTextarea.examples';

void PixelBareTextarea;

export default defineManifest({
  name: 'PixelBareTextarea',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Unstyled escape-hatch <textarea> passthrough for building custom multi-line inputs without the opinionated PixelTextarea chrome.',
  highlights: [
    'Zero styling — pure passthrough to the native <textarea> element',
    'Forwards every standard TextareaHTMLAttributes prop (value, rows, maxLength, etc.)',
    'forwardRef-friendly: refs land on the underlying HTMLTextAreaElement',
    'SSR-safe and tree-shakable; no runtime state or context',
    'Ideal for composing bespoke field chrome while keeping native form semantics',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'read-only', label: 'Read only', Component: ReadOnly },
    { id: 'with-custom-styling', label: 'With custom styling', Component: WithCustomStyling },
    { id: 'with-max-length', label: 'With max length', Component: WithMaxLength },
    { id: 'required', label: 'Required', Component: Required },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['textbox'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into and out of the textarea' },
      { key: 'Enter', does: 'Inserts a newline within the textarea' },
      { key: 'Shift+Tab', does: 'Moves focus to the previous focusable element' },
    ],
    notes:
      'Renders a native <textarea> so screen readers announce the textbox role with multiline semantics automatically. Because no chrome is applied, callers MUST supply a visible <label> (htmlFor) or an aria-label so the field has an accessible name. Pair with aria-required, aria-invalid, and aria-describedby for validation flows.',
  },
  related: ['PixelTextarea', 'PixelBareInput', 'PixelBareButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
