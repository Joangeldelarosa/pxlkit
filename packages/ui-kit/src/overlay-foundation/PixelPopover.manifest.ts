import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithArrow, SidePlacement, InteractiveContent } from './PixelPopover.examples';

export default defineManifest({
  name: 'PixelPopover',
  category: 'overlay-foundation',
  since: '1.8.0',
  status: 'stable',
  description:
    'Controlled floating panel anchored to a trigger, with focus return, dismiss-on-escape, and outside-click handling.',
  highlights: [
    'Controlled open state for predictable behaviour: `open` + `onOpenChange` (React), `v-model:open` (Vue), `[(open)]` (Angular)',
    'Floating-UI placement with side, align, and sideOffset',
    'closeOnEscape and closeOnOutsideClick dismissal',
    'Portal-rendered content with surface-aware theming',
    'Compound API: Trigger, Content, Arrow',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-arrow', label: 'With arrow', Component: WithArrow },
    { id: 'side-placement', label: 'Side placement', Component: SidePlacement },
    { id: 'interactive-content', label: 'Interactive content', Component: InteractiveContent },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['dialog'],
    keyboard: [
      { key: 'Escape', does: 'Closes the popover when closeOnEscape is true and returns focus to the trigger' },
    ],
    notes:
      'Content renders with role="dialog" by default; pair with aria-labelledby on Content. Set role="none" when an inner widget owns semantics. While the content is open, the trigger points at it with aria-controls (Content keeps the id it is given, or gets a generated one); a trigger that sets its own aria-controls keeps it. When the content closes while it holds focus, focus returns to the trigger; after a press outside, focus follows the pointer instead.',
  },
  related: ['PixelTooltip', 'PixelDropdown', 'PixelModal'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
