import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelAlertDialog } from './PixelAlertDialog';
import { Default, Destructive, AsyncAction } from './PixelAlertDialog.examples';

void PixelAlertDialog;

export default defineManifest({
  name: 'PixelAlertDialog',
  category: 'overlays',
  since: '1.8.0',
  status: 'stable',
  description:
    'Modal confirmation dialog for destructive or irreversible actions, with async-aware action handling and Cancel-focused defaults.',
  highlights: [
    'role="alertdialog" + aria-modal with initial focus pinned to Cancel for safer destructive flows',
    'Async onAction with pending state, spinner, and stays open on rejection when onError is provided',
    'Destructive tone variant switches the action accent to red',
    'Surface-aware styling via useEffectiveSurface (pixel chrome vs. modern)',
    'Scroll lock, focus trap, and Escape-to-close baked in',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'destructive', label: 'Destructive', Component: Destructive },
    { id: 'async-action', label: 'Async Action', Component: AsyncAction },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['alertdialog', 'focus-trap', 'initial-focus-cancel', 'aria-describedby'],
    keyboard: [
      { key: 'Escape', does: 'Closes the dialog', when: 'not pending' },
      { key: 'Tab', does: 'Cycles focus inside the dialog' },
      { key: 'Enter', does: 'Activates the focused button' },
    ],
    notes:
      'Initial focus is placed on the Cancel button to prevent accidental confirmation of destructive actions.',
  },
  related: ['PixelDialog', 'PixelPortal'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
