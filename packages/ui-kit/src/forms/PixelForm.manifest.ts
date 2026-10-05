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
    'Validated form on each framework\'s form library (React Hook Form, VeeValidate, Angular reactive forms): its form, field, item, label, control, description and message parts auto-wire ids and aria-* across each field.',
  highlights: [
    'Compound API for composable forms: form, field, item, label, control, description and message (`PixelForm.Root` + `.Field` + … in React, `PixelForm` + `PixelFormField` + … in Vue, `form[pxlForm]` + `[pxlFormField]` + … in Angular).',
    'Auto-generates linked ids and wires `aria-describedby` + `aria-invalid` on the controlled field.',
    'Built on each framework\'s form library — React Hook Form, VeeValidate, Angular reactive forms — so any control it binds works: `value`/`onChange`/`ref` in React, `v-model` in Vue, a `ControlValueAccessor` in Angular.',
    'The message shows the field error, as an alert, while there is one; in React and Vue, content you give it shows instead.',
    'Surface-aware: a `surface` on the form, label, description or message follows kit-wide design tokens.',
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
      'Each item generates a stable id base and links the label (`for`), the control (id + aria-describedby + aria-invalid), the description (id) and the message (id, role="alert" on error) automatically — authors do not pass ids manually.',
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
