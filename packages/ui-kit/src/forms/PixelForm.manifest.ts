import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelForm } from './PixelForm';
import { Default } from './PixelForm.examples';

void PixelForm;

export default defineManifest({
  name: 'PixelForm',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'shadcn-style compound wrapper around react-hook-form: Root / Field / Item / Label / Control / Description / Message auto-wire ids and aria-* across each field.',
  highlights: [
    'Compound API (`PixelForm.Root` + `.Field` + `.Item` + `.Label` + `.Control` + `.Description` + `.Message`) for composable forms.',
    'Auto-generates linked ids and wires `aria-describedby` + `aria-invalid` on the controlled field.',
    'Uses `react-hook-form` `Controller` under the hood — works with any input that accepts `value`/`onChange`/`ref`.',
    '`Message` auto-renders the field error when present; falls back to children otherwise.',
    'Surface-aware: `surface` prop on Root/Label/Description/Message follows kit-wide design tokens.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['form', 'labelled-control'],
    keyboard: [
      { key: 'Tab', does: 'Move focus between form controls.' },
      { key: 'Enter', does: 'Submit the form from any focused input.' },
    ],
    notes:
      'Each `PixelForm.Item` generates a stable `useId()` base and links the Label (htmlFor), Control (id + aria-describedby + aria-invalid), Description (id), and Message (id, role="alert" on error) automatically — authors do not pass ids manually.',
  },
  related: [
    'PixelInput',
    'PixelTextarea',
    'PixelSelect',
    'PixelCheckbox',
    'PixelRadioGroup',
  ],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
