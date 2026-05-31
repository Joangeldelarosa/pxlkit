import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSkeleton } from '../feedback';
import {
  Default,
  TextBlock,
  Rounded,
  Surfaces,
  CardPlaceholder,
  CustomLabel,
} from './PixelSkeleton.examples';

void PixelSkeleton;

export default defineManifest({
  name: 'PixelSkeleton',
  category: 'feedback',
  since: '1.0.0',
  status: 'stable',
  description:
    'Animated loading placeholder that reserves layout space while async content resolves.',
  highlights: [
    'Width/height props accept any CSS length so blocks can mirror the final content footprint.',
    'Pixel and linear surfaces match the rest of the kit — sharp pixel corners or smooth rounded fills.',
    '`rounded` flips between square/avatar shapes (circle on linear, 2px chamfer on pixel).',
    'Ships with `role="status"` and an overridable `ariaLabel` for screen-reader-friendly loading.',
    'Forwards refs and arbitrary div attributes — drop it anywhere a placeholder block is needed.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'text-block', label: 'Text Block', Component: TextBlock },
    { id: 'rounded', label: 'Rounded', Component: Rounded },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'card-placeholder', label: 'Card Placeholder', Component: CardPlaceholder },
    { id: 'custom-label', label: 'Custom Label', Component: CustomLabel },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['status'],
    notes:
      'Renders with `role="status"` and a polite implicit live region. Override `ariaLabel` when the placeholder represents a specific resource (e.g. "Loading user profile") so assistive tech announces what is loading.',
  },
  related: ['PixelSpinner', 'PixelProgress', 'PixelEmptyState'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
