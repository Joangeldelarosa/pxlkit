import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBadgeGroup } from './PixelBadgeGroup';
import { Default, Overflow, Surfaces } from './PixelBadgeGroup.examples';

void PixelBadgeGroup;

export default defineManifest({
  name: 'PixelBadgeGroup',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Inline row of badges with automatic "+N" overflow popover when the count exceeds `max`.',
  highlights: [
    'Renders the first `max - 1` badges inline; remaining items collapse into a "+N" trigger.',
    'Overflow trigger opens a PixelPopover with the hidden badges, surface-matched.',
    'Wrapper becomes `role="group"` when an accessible name (aria-label or aria-labelledby) is provided.',
    'Surface-aware: pixel chamfered radius + pixel font or linear pill, propagated to the popover.',
    'Forwarded ref to the underlying div and full passthrough of HTMLAttributes.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'overflow', label: 'Overflow +N', Component: Overflow },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['group', 'disclosure'],
    keyboard: [
      { key: 'Enter', does: 'Opens the overflow popover.', when: 'focus on +N trigger' },
      { key: 'Space', does: 'Opens the overflow popover.', when: 'focus on +N trigger' },
      { key: 'Escape', does: 'Closes the overflow popover.', when: 'overflow popover is open' },
    ],
    notes:
      'Group landmark is only emitted when an accessible name is supplied to avoid an unlabeled "group" announcement. The overflow button carries aria-label="Show N more", aria-expanded, aria-haspopup="dialog", and aria-controls wired by PixelPopover.',
  },
  related: ['PixelBadge', 'PixelChipGroup', 'PixelPopover', 'PixelAvatarGroup'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
