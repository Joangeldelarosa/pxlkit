import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  WithOverflow,
  Sizes,
  Tones,
  Surfaces,
} from './PixelAvatarGroup.examples';

export default defineManifest({
  name: 'PixelAvatarGroup',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Clusters PixelAvatar children into an overlapping row with a tone-aware "+N" overflow tile when the count exceeds max.',
  highlights: [
    'Overlapping layout with surface-aware ring isolation against the page background',
    'Configurable max — extras collapse into a single "+N more" tile (tone-aware)',
    'Five sizes (xs/sm/md/lg/xl) with proportional negative-margin overlap',
    'Surface-aware radius (pixel → squared 3px / linear → fully rounded)',
    'role="group" only when an accessible name is provided (aria-label / aria-labelledby)',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-overflow', label: 'With Overflow', Component: WithOverflow },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['group'],
    notes:
      'Provide aria-label or aria-labelledby summarizing the count (e.g. "5 team members"); without one, role=group is dropped so the cluster is treated as presentational. The "+N" overflow tile carries its own aria-label ("N more users") so assistive tech announces the hidden count.',
  },
  related: ['PixelAvatar', 'PixelBadge', 'PixelChip'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
