import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCarousel } from './PixelCarousel';
import {
  Default,
  WithDots,
  Looping,
  Vertical,
  LinearSurface,
} from './PixelCarousel.examples';

void PixelCarousel;

export default defineManifest({
  name: 'PixelCarousel',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Embla-powered surface-aware carousel with horizontal or vertical orientation, optional arrows and dot pagination, keyboard navigation and reduced-motion support.',
  highlights: [
    'Built on embla-carousel with full opts and plugins pass-through',
    'Horizontal or vertical orientation with arrow and dot navigation',
    'Keyboard navigation (Arrow keys) and aria-roledescription="carousel" landmark',
    'Surface-aware (pixel or linear) with focus-ring tokens',
    'Honors prefers-reduced-motion by zeroing transition duration',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-dots', label: 'With dots', Component: WithDots },
    { id: 'looping', label: 'Looping', Component: Looping },
    { id: 'vertical', label: 'Vertical', Component: Vertical },
    { id: 'linear-surface', label: 'Linear surface', Component: LinearSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['carousel'],
    keyboard: [
      { key: 'ArrowLeft', does: 'Scrolls to the previous slide', when: 'orientation is horizontal' },
      { key: 'ArrowRight', does: 'Scrolls to the next slide', when: 'orientation is horizontal' },
      { key: 'ArrowUp', does: 'Scrolls to the previous slide', when: 'orientation is vertical' },
      { key: 'ArrowDown', does: 'Scrolls to the next slide', when: 'orientation is vertical' },
      { key: 'Tab', does: 'Moves focus into and out of the carousel region' },
    ],
    notes:
      'Root element is role="region" with aria-roledescription="carousel" and a focusable tabIndex. Each item is role="group" with aria-roledescription="slide" and aria-label "Slide N of M". Previous/Next buttons declare aria-label and aria-controls pointing to the viewport id. A polite live region announces the current slide index without reading slide content (per APG carousel pattern). Dots expose aria-current="true" on the active slide.',
  },
  related: ['PixelTabs', 'PixelPagination'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
