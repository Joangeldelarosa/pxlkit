import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelDrawer } from './PixelDrawer';
import { Default, LeftSide, BottomSheet } from './PixelDrawer.examples';

export default defineManifest({
  name: 'PixelDrawer',
  category: 'overlays',
  since: '1.8.0',
  status: 'stable',
  description:
    'Side-anchored modal panel (right/left/top/bottom) with focus trap, scroll lock and Escape-to-close.',
  highlights: [
    'Four anchor sides (right/left/top/bottom) and five sizes (sm/md/lg/xl/full)',
    'Focus trap, scroll lock and Escape-to-close out of the box',
    'WCAG 4.1.2 compliant: requires `title` or `aria-label` for accessible name',
    'Surface-aware borders inherited from theme context',
    'Composable subparts: PixelDrawer.Header / Body / Footer',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'left-side', label: 'Left side, large', Component: LeftSide },
    { id: 'bottom-sheet', label: 'Bottom sheet', Component: BottomSheet },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role="dialog" with aria-modal="true"',
      'Focus trap inside panel (WCAG 2.1.2 No Keyboard Trap)',
      'Scroll lock on body while open',
      'Escape key closes the drawer',
      'Accessible name via `title` (aria-labelledby) or `aria-label`',
    ],
    keyboard: [
      { key: 'Escape', does: 'Closes the drawer', when: 'drawer is open' },
      { key: 'Tab', does: 'Cycles focus within the drawer panel' },
      { key: 'Shift+Tab', does: 'Cycles focus backward within the drawer panel' },
    ],
    notes:
      'Dev-only warning fires when neither `title` nor `aria-label` is provided to enforce WCAG 4.1.2.',
  },
  related: ['PixelModal', 'PixelPortal', 'PixelSheet'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
