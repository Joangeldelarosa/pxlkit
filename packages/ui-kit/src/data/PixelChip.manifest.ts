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
    'Renders as a <button> when it handles clicks (`onClick` in React, `@click` in Vue, `<button pxlChip>` in Angular) for native keyboard + screen reader semantics',
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
      'Renders as a <button> only when it handles clicks (`onClick`, `@click` in Vue, `button[pxlChip]` or `clickable` in Angular), so non-interactive chips stay static. The delete X is a <button> with aria-label "Remove <label>" that never fires the chip click; a button cannot contain a button, so on a clickable chip the label and the X are sibling buttons inside a <span> frame. On a clickable deletable chip the frame shows the label button\'s keyboard focus; the X shows its own.',
  },
  related: ['PixelBadge', 'PixelChipGroup', 'PixelToggle'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
