import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBadge } from '../data-display';
import {
  Default,
  Tones,
  Sizes,
  Variants,
  Surfaces,
  WithIcon,
  Clickable,
} from './PixelBadge.examples';

void PixelBadge;

export default defineManifest({
  name: 'PixelBadge',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Compact status indicator that labels objects with tone, variant, and optional icon — renders as a pill (linear) or chamfered tag (pixel).',
  highlights: [
    'Four variants — soft (default), solid, outline, ghost — across all tone keys.',
    'Three sizes (sm/md/lg) with consistent vertical rhythm and font scale.',
    'Optional iconLeft slot for status dots, glyphs, or counters.',
    'Becomes a native <button> with focus ring and hover when onClick is provided.',
    'Surface-aware: pixel chamfered border + pixel font, or linear pill.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'variants', label: 'Variants', Component: Variants },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'clickable', label: 'Clickable', Component: Clickable },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['status'],
    keyboard: [
      { key: 'Enter', does: 'Activates the badge when onClick is provided.', when: 'interactive (onClick set)' },
      { key: 'Space', does: 'Activates the badge when onClick is provided.', when: 'interactive (onClick set)' },
    ],
    notes:
      'Default render is a non-interactive <span>. When onClick is set, the root becomes a native <button type="button"> with a visible focus ring (focus-visible:ring-2 ring-offset). iconLeft is marked aria-hidden via inline-flex wrapper — convey meaning through the badge text, not the icon alone. For live status changes (e.g., "online" → "offline"), wrap the badge in a parent with aria-live="polite".',
  },
  related: ['PixelChip', 'PixelBadgeGroup', 'PixelRibbon', 'PixelAvatar'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
