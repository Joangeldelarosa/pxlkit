import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithArrow, SidePlacement } from './PixelPopover.examples';

export default defineManifest({
  name: 'PixelPopover',
  category: 'overlay-foundation',
  since: '1.8.0',
  status: 'stable',
  description:
    'Controlled floating panel anchored to a trigger, with focus return, dismiss-on-escape, and outside-click handling.',
  highlights: [
    'Controlled open/onOpenChange API for predictable state',
    'Floating-UI placement with side, align, and sideOffset',
    'closeOnEscape and closeOnOutsideClick dismissal',
    'Portal-rendered content with surface-aware theming',
    'Compound API: Trigger, Content, Arrow',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-arrow', label: 'With arrow', Component: WithArrow },
    { id: 'side-placement', label: 'Side placement', Component: SidePlacement },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['dialog', 'aria-labelledby', 'focus-return'],
    keyboard: [
      { key: 'Escape', does: 'Closes the popover when closeOnEscape is true' },
    ],
    notes:
      'Content renders with role="dialog" by default; pair with aria-labelledby on Content. Set role="none" when an inner widget owns semantics.',
  },
  related: ['PixelTooltip', 'PixelDropdown', 'PixelModal'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
