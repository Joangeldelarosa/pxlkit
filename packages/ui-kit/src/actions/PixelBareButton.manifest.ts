import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  WithCustomClass,
  Disabled,
  WithOnClick,
  SubmitType,
  AsIconTrigger,
} from './PixelBareButton.examples';

export default defineManifest({
  name: 'PixelBareButton',
  category: 'actions',
  since: '1.0.0',
  status: 'stable',
  description:
    'Unstyled passthrough <button> primitive — escape hatch for composing custom buttons without inheriting pixel-kit visuals.',
  highlights: [
    'Zero styling — renders a raw <button> with all native attributes forwarded',
    'Defaults type="button" to prevent accidental form submissions',
    'Forwards refs to the underlying HTMLButtonElement',
    'Ideal for icon triggers, custom-styled CTAs, or wrapping inside compound components',
    'Tree-shakable and SSR-safe',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-custom-class', label: 'With custom class', Component: WithCustomClass },
    { id: 'with-on-click', label: 'With onClick', Component: WithOnClick },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'submit-type', label: 'Submit / reset type', Component: SubmitType },
    { id: 'as-icon-trigger', label: 'As icon trigger', Component: AsIconTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the button' },
      { key: 'Space', does: 'Activates the button' },
    ],
    notes:
      'Renders a native <button>, so keyboard activation and focus semantics come for free. Consumer is responsible for visible focus styles, contrast, and providing aria-label when the button has no text content (e.g. icon-only triggers).',
  },
  related: ['PixelButton', 'PixelBareInput', 'PixelBareTextarea'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
