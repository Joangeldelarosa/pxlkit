import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  Tones,
  Sizes,
  Variants,
  Surfaces,
  WithIcon,
  Clickable,
  Deletable,
  ClickableAndDeletable,
} from './PixelChip.examples';

export default defineManifest({
  name: 'PixelChip',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Compact label tag for representing tags, filters, or selections, optionally clickable or removable via an inline delete control.',
  highlights: [
    'Four visual variants (soft, solid, outline, ghost) across the full tone palette',
    'Three sizes (sm, md, lg) with consistent padding + typography rhythm',
    'Optional leading icon slot and built-in deletable X button with stop-propagation',
    'Renders as <button> when onClick is set for native keyboard + screen reader semantics',
    'Pixel + linear surface variants share identical API and chamfered/pill geometry',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'variants', label: 'Variants', Component: Variants },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'clickable', label: 'Clickable', Component: Clickable },
    { id: 'deletable', label: 'Deletable', Component: Deletable },
    {
      id: 'clickable-and-deletable',
      label: 'Clickable + Deletable',
      Component: ClickableAndDeletable,
    },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the chip when onClick is provided', when: 'chip is focused' },
      { key: 'Space', does: 'Activates the chip when onClick is provided', when: 'chip is focused' },
      { key: 'Enter', does: 'Removes the chip via the X button', when: 'delete button is focused' },
    ],
    notes:
      'Renders as a <button> only when onClick is provided so non-interactive chips stay as <span>. The delete X is always a nested <button> with an aria-label "Remove <label>" and stops click propagation so the parent onClick does not double-fire.',
  },
  related: ['PixelBadge', 'PixelChipGroup', 'PixelToggle'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
