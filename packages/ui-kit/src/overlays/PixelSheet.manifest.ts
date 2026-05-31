import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSheet } from './PixelSheet';
import { Default, WithDragHandle, TopFull } from './PixelSheet.examples';

export default defineManifest({
  name: 'PixelSheet',
  category: 'overlays',
  since: '1.8.0',
  status: 'stable',
  description:
    'Mobile-first bottom/top sheet with focus trap, scroll lock, Escape-to-close and optional drag handle.',
  highlights: [
    'Bottom or top anchored, four sizes (sm/md/lg/full)',
    'Focus trap, scroll lock and Escape-to-close out of the box',
    'Optional drag handle affordance for touch dismissal',
    'WCAG 4.1.2 compliant: requires `title` or `aria-label` for accessible name',
    'Surface-aware borders inherited from theme context',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-drag-handle', label: 'With drag handle', Component: WithDragHandle },
    { id: 'top-full', label: 'Top side, full height', Component: TopFull },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role="dialog" with aria-modal="true"',
      'Focus trap inside panel (WCAG 2.1.2 No Keyboard Trap)',
      'Scroll lock on body while open',
      'Escape key closes the sheet',
      'Accessible name via `title` (aria-labelledby) or `aria-label`',
    ],
    keyboard: [
      { key: 'Escape', does: 'Closes the sheet', when: 'sheet is open' },
      { key: 'Tab', does: 'Cycles focus within the sheet panel' },
      { key: 'Shift+Tab', does: 'Cycles focus backward within the sheet panel' },
    ],
    notes:
      'Dev-only warning fires when neither `title` nor `aria-label` is provided to enforce WCAG 4.1.2. Drag handle is decorative (aria-hidden) and intended as a visual affordance only.',
  },
  related: ['PixelDrawer', 'PixelModal', 'PixelPortal'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
