import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTextLink } from '../data-display';
import {
  Default,
  Tones,
  AsButton,
  Surfaces,
  ExternalLink,
  InlineInProse,
} from './PixelTextLink.examples';

void PixelTextLink;

export default defineManifest({
  name: 'PixelTextLink',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Inline anchor or button styled as a tone-coloured underlined link for prose, callouts, and CTAs.',
  highlights: [
    'Polymorphic: renders <a> when `href` is provided, <button type="button"> otherwise',
    'Seven brand tones (cyan default) with consistent focus ring and hover behaviour',
    'Surface-aware typography (pixel vs linear) via shared surface context',
    'Forwards native anchor/button attributes (target, rel, onClick, aria-*, etc.)',
    'SSR-safe and tree-shakable; zero runtime state',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'as-button', label: 'As button', Component: AsButton },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'external-link', label: 'External link', Component: ExternalLink },
    { id: 'inline-in-prose', label: 'Inline in prose', Component: InlineInProse },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['link', 'button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the link or button' },
      { key: 'Space', does: 'Activates the control when rendered as a button', when: 'href is omitted' },
      { key: 'Tab', does: 'Moves focus to the link' },
    ],
    notes:
      'Visible focus ring via focus-visible:ring-2; renders semantic <a> when href is provided and <button type="button"> otherwise so assistive tech announces the correct role. Pair external links with target/rel and consider adding a visible affordance for "opens in new tab".',
  },
  related: ['PixelButton', 'PixelBreadcrumb'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
