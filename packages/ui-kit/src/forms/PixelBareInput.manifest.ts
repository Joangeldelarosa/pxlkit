import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Controlled,
  Default,
  Disabled,
  Email,
  Number,
  Password,
  ReadOnly,
  Required,
  Uncontrolled,
  WithRef,
} from './PixelBareInput.examples';

export default defineManifest({
  name: 'PixelBareInput',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Unstyled, forwardRef-enabled `<input>` primitive used as an escape hatch for fully custom field compositions.',
  highlights: [
    'Native `<input>` semantics — accepts every `InputHTMLAttributes` prop verbatim.',
    'forwardRef passthrough exposes the underlying `HTMLInputElement` for measurement, focus, or imperative APIs.',
    'Zero styling — pair with parent surfaces (PixelInputGroup, PixelFieldset) when building bespoke field widgets.',
    'SSR-safe and tree-shakable — no client effects or runtime dependencies.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'email', label: 'Email', Component: Email },
    { id: 'password', label: 'Password', Component: Password },
    { id: 'number', label: 'Number', Component: Number },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'read-only', label: 'Read-only', Component: ReadOnly },
    { id: 'required', label: 'Required', Component: Required },
    { id: 'with-ref', label: 'With ref', Component: WithRef },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['textbox'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into / out of the input.' },
      { key: 'Enter', does: 'Submits the surrounding form when present.' },
    ],
    notes:
      'Because this primitive is unstyled, callers MUST supply an accessible name via `aria-label`, `aria-labelledby`, or an associated `<label>` element. Visual focus styling is the consumer\'s responsibility.',
  },
  related: ['PixelInput', 'PixelBareTextarea', 'PixelBareButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
