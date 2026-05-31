import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelModal } from '../overlay';
import {
  Default,
  Sizes,
  Surfaces,
  WithDescription,
  WithFooter,
  AsyncClose,
  CustomCloseLabel,
} from './PixelModal.examples';

void PixelModal;

export default defineManifest({
  name: 'PixelModal',
  category: 'overlays',
  since: '1.0.0',
  status: 'stable',
  description:
    'Centered modal dialog with title bar, optional description and footer, surface-aware chrome, focus trap, scroll lock, and async close support.',
  highlights: [
    'Five sizes (sm/md/lg/xl/full) with surface-aware chrome — pixel renders an old-school window, linear a flat card',
    'Focus trap, scroll lock, and Escape-to-close come built in via shared hooks',
    'Optional description wired via aria-describedby and optional footer slot for actions',
    'asyncClose awaits a promise (with loading affordance on the close button) before unmounting',
    'Portals to document.body by default; accepts a custom container override',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-description', label: 'With description', Component: WithDescription },
    { id: 'with-footer', label: 'With footer', Component: WithFooter },
    { id: 'async-close', label: 'Async close', Component: AsyncClose },
    { id: 'custom-close-label', label: 'Custom close label', Component: CustomCloseLabel },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['dialog'],
    keyboard: [
      { key: 'Escape', does: 'Closes the modal (awaits asyncClose if provided)' },
      { key: 'Tab', does: 'Cycles focus within the trapped dialog' },
      { key: 'Shift+Tab', does: 'Cycles focus backwards within the trapped dialog' },
    ],
    notes:
      'Renders with role="dialog" and aria-modal="true". Title is exposed via aria-labelledby; description (when provided) via aria-describedby. The close button advertises aria-busy while asyncClose is in flight. Backdrop click is equivalent to Escape and is disabled while closing to avoid double-firing.',
  },
  related: ['PixelDrawer', 'PixelAlertDialog', 'PixelSheet', 'PixelPopover'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
