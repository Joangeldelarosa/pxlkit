import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelFeatureCard } from './PixelFeatureCard';
import {
  Default,
  WithIcon,
  WithBadge,
  Tones,
  Surfaces,
  Horizontal,
  Interactive,
  AsLink,
  WithFooter,
  ClampedDescription,
  IconSizes,
} from './PixelFeatureCard.examples';

void PixelFeatureCard;

export default defineManifest({
  name: 'PixelFeatureCard',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description:
    'Feature highlight card with toned icon frame, optional badge, title, clamped description, and footer — renders as <article>, role="button", or <a href> with full-card click target.',
  highlights: [
    'Toned icon frame (48/56/64/80px) with surface-aware border and soft background',
    'Optional badge slot above the icon with independent tone',
    'Vertical or horizontal orientation with consistent alignment',
    'Polymorphic root: <article>, interactive role="button" with Enter/Space, or <a href> with full-card target',
    'Clamped description (2/3/4 lines) keeps cards aligned in grids',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'with-badge', label: 'With Badge', Component: WithBadge },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'horizontal', label: 'Horizontal', Component: Horizontal },
    { id: 'interactive', label: 'Interactive', Component: Interactive },
    { id: 'as-link', label: 'As Link', Component: AsLink },
    { id: 'with-footer', label: 'With Footer', Component: WithFooter },
    { id: 'clamped-description', label: 'Clamped Description', Component: ClampedDescription },
    { id: 'icon-sizes', label: 'Icon Sizes', Component: IconSizes },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button', 'link'],
    keyboard: [
      { key: 'Enter', does: 'Activates the card when interactive (role="button") or follows the link when href is set' },
      { key: 'Space', does: 'Activates the card when interactive (role="button")', when: 'interactive prop is true and href is not set' },
      { key: 'Tab', does: 'Moves focus to the card when interactive or anchored' },
    ],
    notes:
      'Semantic <article> by default. When interactive without href, the root becomes <article role="button" tabIndex={0}> with Enter/Space activation parity. When href is set, the root renders as a native <a> with the entire card as the click target — nesting interactive children (PixelButton, PixelTextLink) inside footer is invalid HTML in href mode and breaks screen reader navigation. Focus-visible ring is provided automatically in both interactive modes.',
  },
  related: ['PixelCard', 'PixelStatCard', 'PixelPricingCard', 'PixelTestimonialCard'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
