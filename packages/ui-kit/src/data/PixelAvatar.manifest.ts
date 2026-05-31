import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  Sizes,
  Tones,
  Surfaces,
  Shapes,
  Statuses,
  WithImage,
  ColorSeed,
} from './PixelAvatar.examples';

export default defineManifest({
  name: 'PixelAvatar',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Displays a user identity as an initials-or-image badge with optional status dot, tone, shape, and deterministic colored fallback.',
  highlights: [
    'Initials fallback locale-aware via PxlKitLocale (uppercases per locale rules)',
    'Five sizes (xs/sm/md/lg/xl) and three shapes (circle/rounded/square)',
    'Optional status dot (online/away/busy/offline) baked into the accessible name',
    'Deterministic tinted fallback via `colorSeed` (djb2 hash → tone palette)',
    'Lazy/async image loading when `src` is provided',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'shapes', label: 'Shapes', Component: Shapes },
    { id: 'statuses', label: 'Statuses', Component: Statuses },
    { id: 'with-image', label: 'With Image', Component: WithImage },
    { id: 'color-seed', label: 'Color Seed', Component: ColorSeed },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['img'],
    notes:
      'Avatar is a presentational identity badge. The user name is exposed via `title`; when `status` is set the status word is appended into the accessible name (no live region — status dots are not transient announcements). When `src` is provided the inner <img> uses the same accessible name as its alt text.',
  },
  related: ['PixelAvatarGroup', 'PixelBadge', 'PixelChip'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
