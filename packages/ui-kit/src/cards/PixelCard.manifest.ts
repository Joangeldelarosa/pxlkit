import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  Headerless,
  WithIcon,
  WithDescription,
  WithFooter,
  Tones,
  Surfaces,
  Interactive,
  AsLink,
  WithMedia,
  WithBadge,
  ClampedDescription,
  PaddingScale,
  WithSubcomponents,
} from './PixelCard.examples';

export default defineManifest({
  name: 'PixelCard',
  category: 'cards',
  since: '1.0.0',
  status: 'stable',
  description:
    'Container card with title, optional icon, description, media, ribbon badge, body, and footer — surfaces as <article>, <a href>, or role="button" depending on props.',
  highlights: [
    'Pixel + linear surfaces with optional tone tint on border and soft background',
    'Polymorphic root: renders as <article>, <a href>, or interactive role="button" with Enter/Space activation',
    'Media slot, corner ribbon badge, clamped description, padding scale, and composable Header/Body/Footer subcomponents',
    'Focus-visible ring + keyboard parity when interactive or anchored',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'headerless', label: 'Headerless', Component: Headerless },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'with-description', label: 'With Description', Component: WithDescription },
    { id: 'with-footer', label: 'With Footer', Component: WithFooter },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'interactive', label: 'Interactive', Component: Interactive },
    { id: 'as-link', label: 'As Link', Component: AsLink },
    { id: 'with-media', label: 'With Media', Component: WithMedia },
    { id: 'with-badge', label: 'With Ribbon Badge', Component: WithBadge },
    { id: 'clamped-description', label: 'Clamped Description', Component: ClampedDescription },
    { id: 'padding-scale', label: 'Padding Scale', Component: PaddingScale },
    { id: 'with-subcomponents', label: 'With Subcomponents', Component: WithSubcomponents },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the card when interactive (role="button") or follows the link when href is set' },
      { key: 'Space', does: 'Activates the card when interactive (role="button")', when: 'interactive prop is true and href is not set' },
      { key: 'Tab', does: 'Moves focus to the card when interactive or anchored' },
    ],
    notes:
      'When interactive without href, the root renders as <div role="button" tabIndex={0}> with Enter/Space activation parity (<article> does not permit role="button"). When href is set, the root renders as a native <a> — nesting interactive children (buttons, links) inside footer or media is invalid in href mode and breaks screen reader navigation. Focus-visible ring is provided automatically in both interactive modes.',
  },
  related: ['PixelStatCard', 'PixelFeatureCard', 'PixelPricingCard', 'PixelTestimonialCard'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
