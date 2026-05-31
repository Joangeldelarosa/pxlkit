import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { PixelSpinner } from './PixelSpinner'
import {
  Default,
  Sizes,
  Tones,
  PixelSurface,
  Decorative,
} from './PixelSpinner.examples'

void PixelSpinner

export default defineManifest({
  name: 'PixelSpinner',
  category: 'feedback',
  since: '1.9.0',
  status: 'stable',
  description:
    'Compact loading indicator with surface-aware animation (stepped on pixel, smooth on linear) and tone-driven color.',
  highlights: [
    'Four sizes (xs/sm/md/lg) and seven tones aligned with token palette',
    'Surface-aware: 8-step pixel rotation vs smooth linear sweep',
    'Respects prefers-reduced-motion (freezes animation, keeps shape)',
    'role=status with sr-only label by default; decorative mode for nested use',
    'forwardRef to the host span; SSR-safe and tree-shakable',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'pixel-surface', label: 'Pixel surface', Component: PixelSurface },
    { id: 'decorative', label: 'Decorative (inside aria-busy parent)', Component: Decorative },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['status'],
    keyboard: [],
    notes:
      'Default renders role=status with aria-label="Loading" and a visually-hidden label for SR. Pass `decorative` when the parent already announces busy state (e.g. button with aria-busy) to avoid double announcements. Honors prefers-reduced-motion.',
  },
  related: ['PixelAlert', 'PixelToast'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
