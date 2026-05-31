import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelFileUpload } from './PixelFileUpload';
import { Default, ButtonMode, WithError } from './PixelFileUpload.examples';

export default defineManifest({
  name: 'PixelFileUpload',
  category: 'forms',
  since: '1.8.0',
  status: 'stable',
  description:
    'Dropzone + click-to-browse file uploader with accept/size/count validation, image thumbnails, and per-item removal.',
  highlights: [
    'Drag-and-drop or click/keyboard to open the native file picker',
    'Validates against accept, maxSize, and maxFiles with onReject callback',
    'Image previews via object URLs with automatic revoke on unmount',
    'Controlled or uncontrolled file list via useControllableState',
    'Surface-aware styling with size, label, hint, and error props',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'button-mode', label: 'Button mode', Component: ButtonMode },
    { id: 'with-error', label: 'With error', Component: WithError },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button-like dropzone', 'aria-describedby for accepted formats'],
    keyboard: [
      { key: 'Enter', does: 'Opens the native file picker', when: 'dropzone has focus' },
      { key: 'Space', does: 'Opens the native file picker', when: 'dropzone has focus' },
    ],
    notes:
      'Dropzone exposes role="button" with tabIndex 0 (or -1 when disabled) and aria-describedby pointing at the hint/error message. The hidden <input type="file"> is aria-hidden while the dropzone is active.',
  },
  related: ['PixelInput', 'PixelTextarea', 'PixelForm'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
