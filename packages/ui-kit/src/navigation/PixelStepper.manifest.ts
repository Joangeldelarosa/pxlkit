import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelStepper } from '../navigation';
import {
  AllowNextStepsSelect,
  Default,
  Interactive,
  Sizes,
  States,
  Surfaces,
  Vertical,
} from './PixelStepper.examples';

void PixelStepper;

export default defineManifest({
  name: 'PixelStepper',
  category: 'navigation',
  since: '1.9.0',
  status: 'stable',
  description:
    'Multi-step progress indicator with completed/active/pending/error/loading states, horizontal or vertical orientation, and full keyboard navigation.',
  highlights: [
    'Compound API (PixelStepper + PixelStepper.Step) keeps step content declarative and easy to reorder.',
    'Per-step states (completed, active, pending, error, loading) with tone-mapped indicators and connectors.',
    'Horizontal or vertical orientation with roving focus, Arrow/Home/End keys, and Enter/Space activation.',
    'Optional onStepClick handler with allowNextStepsSelect gate so future steps stay locked until allowed.',
    'Surface-aware (pixel/linear) and size-aware (sm/md/lg), inheriting kit-wide tokens and focus rings.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'interactive', label: 'Interactive', Component: Interactive },
    { id: 'vertical', label: 'Vertical', Component: Vertical },
    { id: 'states', label: 'States', Component: States },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'allow-next-steps-select', label: 'Allow next steps', Component: AllowNextStepsSelect },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['progress-steps'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into/out of the stepper; only clickable steps participate in the tab sequence.' },
      { key: 'ArrowRight', does: 'Focuses the next clickable step.', when: 'orientation="horizontal"' },
      { key: 'ArrowLeft', does: 'Focuses the previous clickable step.', when: 'orientation="horizontal"' },
      { key: 'ArrowDown', does: 'Focuses the next clickable step.', when: 'orientation="vertical"' },
      { key: 'ArrowUp', does: 'Focuses the previous clickable step.', when: 'orientation="vertical"' },
      { key: 'Home', does: 'Focuses the first clickable step.' },
      { key: 'End', does: 'Focuses the last clickable step.' },
      { key: 'Enter', does: 'Activates the focused step (when clickable).' },
      { key: 'Space', does: 'Activates the focused step (when clickable).' },
    ],
    notes:
      'The root renders role="group" with a configurable ariaLabel (defaults to "Progress steps"). A clickable step is role="button", named by its position ("Step N of M"), its label and its state (current/completed/error) and described by its description. A step that is not clickable (no onStepClick, or a future step when allowNextStepsSelect is false) has no role and stays out of the tab sequence; since ARIA does not let an element without a role take a name, it reads its position and state as visually hidden text around its label. The active step is marked with aria-current="step". Indicators and connectors are aria-hidden so screen readers announce only the step label and state.',
  },
  related: ['PixelTabs', 'PixelProgress', 'PixelBreadcrumb'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
