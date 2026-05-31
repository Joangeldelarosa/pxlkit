import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTextarea } from '../inputs';
import {
  Default,
  Uncontrolled,
  Controlled,
  Tones,
  Surfaces,
  WithError,
  Disabled,
  Autosize,
  WithCharCount,
  Required,
} from './PixelTextarea.examples';

void PixelTextarea;

export default defineManifest({
  name: 'PixelTextarea',
  category: 'forms',
  since: '1.0.0',
  status: 'stable',
  description:
    'Multi-line text input with label, hint, error chrome plus optional auto-grow and character counter.',
  highlights: [
    'Label / hint / error chrome via FieldShell — same DX as PixelInput',
    'Optional autosize between minRows and maxRows, scrolling beyond the cap',
    'Character counter (showCount) — total or N/max with overflow styling',
    'Full tone + surface (pixel/linear) theming aligned with the rest of forms',
    'Controlled and uncontrolled value patterns, ref forwards to <textarea>',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-error', label: 'With error', Component: WithError },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'autosize', label: 'Autosize', Component: Autosize },
    { id: 'with-char-count', label: 'With char count', Component: WithCharCount },
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
      'Wraps a native <textarea> so multiline textbox semantics are announced by assistive tech automatically. The label prop is wired through FieldShell, error toggles aria-invalid, and hint/error are exposed via aria-describedby. The counter uses aria-live="polite" so screen readers announce updates without stealing focus.',
  },
  related: ['PixelInput', 'PixelBareTextarea'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
