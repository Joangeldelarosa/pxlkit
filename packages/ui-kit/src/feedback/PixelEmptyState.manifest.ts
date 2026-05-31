import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithIcon, WithAction, WithIconAndAction, Surfaces } from './PixelEmptyState.examples';

export default defineManifest({
  name: 'PixelEmptyState',
  category: 'feedback',
  since: '1.0.0',
  status: 'stable',
  description:
    'Placeholder block for empty collections or no-results states, with optional icon, title, description, and primary action.',
  highlights: [
    'Centered dashed-border container that communicates absence without feeling like an error',
    'Optional icon slot rendered with cyan accent and aria-hidden so it stays decorative',
    'Action slot for a primary recovery CTA (create, refresh, retry)',
    'Pixel + linear surface variants share identical API and inherit the surface from context',
    'SSR-safe and tree-shakable; no client-only hooks beyond surface inheritance',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'with-action', label: 'With Action', Component: WithAction },
    { id: 'with-icon-and-action', label: 'With Icon + Action', Component: WithIconAndAction },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [],
    notes:
      'Renders as a non-interactive <div> with a semantic <h4> for the title and a <p> for the description. The icon is marked aria-hidden so it is not announced. Any action passed via the action slot owns its own keyboard + screen reader semantics.',
  },
  related: ['PixelAlert', 'PixelSkeleton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
