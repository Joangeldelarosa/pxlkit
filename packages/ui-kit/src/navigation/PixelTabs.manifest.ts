import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTabs } from '../navigation';
import {
  Compositional,
  Controlled,
  Default,
  KeepMounted,
  ManualActivation,
  Scrollable,
  Surfaces,
  Vertical,
} from './PixelTabs.examples';

export default defineManifest({
  name: 'PixelTabs',
  category: 'navigation',
  since: '1.0.0',
  status: 'stable',
  description:
    'Tabbed panel with roving tabindex and WAI-ARIA keyboard navigation, available as a sugar items[] API or a compositional List/Trigger/Panel API.',
  highlights: [
    'Sugar API (items[]) for quick setup or compositional API (List/Trigger/Panel) for full control over rendering.',
    'Horizontal or vertical orientation with arrow-key navigation, Home/End edges, and roving tabindex.',
    'Automatic activation (select on focus) or manual activation (Enter/Space confirms).',
    'Optional scrollable tablist with a fade-mask for overflow, and keepMounted for persistent panel state.',
    'Pixel and linear surfaces inherit kit-wide tokens; controlled or uncontrolled via value/defaultTab.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'vertical', label: 'Vertical', Component: Vertical },
    { id: 'manual-activation', label: 'Manual activation', Component: ManualActivation },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'scrollable', label: 'Scrollable', Component: Scrollable },
    { id: 'keep-mounted', label: 'Keep mounted', Component: KeepMounted },
    { id: 'compositional', label: 'Compositional', Component: Compositional },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['tablist'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into/out of the tablist; only the active tab is in the tab sequence (roving tabindex).' },
      { key: 'ArrowRight', does: 'Focuses the next tab (wraps to first).', when: 'orientation="horizontal"' },
      { key: 'ArrowLeft', does: 'Focuses the previous tab (wraps to last).', when: 'orientation="horizontal"' },
      { key: 'ArrowDown', does: 'Focuses the next tab (wraps to first).', when: 'orientation="vertical"' },
      { key: 'ArrowUp', does: 'Focuses the previous tab (wraps to last).', when: 'orientation="vertical"' },
      { key: 'Home', does: 'Focuses the first tab in the list.' },
      { key: 'End', does: 'Focuses the last tab in the list.' },
      { key: 'Enter', does: 'Activates the focused tab.', when: 'activationMode="manual"' },
      { key: 'Space', does: 'Activates the focused tab.', when: 'activationMode="manual"' },
    ],
    notes:
      'Renders role="tablist" on the list container with aria-orientation reflecting the orientation prop, role="tab" on each trigger with aria-selected and aria-controls wiring, and role="tabpanel" on the panel with aria-labelledby pointing back at its trigger. Panels are tabIndex=0 so keyboard users can reach panel content after activating a tab. The active panel is the only one rendered by default; keepMounted preserves all panels in the DOM and uses the hidden attribute to mask inactive ones.',
  },
  related: ['PixelAccordion', 'PixelSegmented', 'PixelStepper'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
