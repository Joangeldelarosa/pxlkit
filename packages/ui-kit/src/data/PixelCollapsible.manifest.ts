import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCollapsible } from './PixelCollapsible';
import {
  Default,
  DefaultOpen,
  Tones,
  Surfaces,
  RichContent,
} from './PixelCollapsible.examples';

void PixelCollapsible;

export default defineManifest({
  name: 'PixelCollapsible',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Toggleable disclosure block with a tone-coloured chevron header that reveals or hides arbitrary content.',
  highlights: [
    'Single-section disclosure pattern with animated chevron rotation',
    'Seven brand tones applied to the header button (neutral default)',
    'Surface-aware typography (pixel vs linear) via shared surface context',
    'Uncontrolled state with `defaultOpen` for SSR-friendly initial render',
    'SSR-safe and tree-shakable; renders children only when expanded',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'default-open', label: 'Default open', Component: DefaultOpen },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'rich-content', label: 'Rich content', Component: RichContent },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['disclosure'],
    keyboard: [
      { key: 'Enter', does: 'Toggles the collapsible open or closed' },
      { key: 'Space', does: 'Toggles the collapsible open or closed' },
      { key: 'Tab', does: 'Moves focus to the disclosure trigger' },
    ],
    notes:
      'Header is a native <button> so assistive tech announces it as a button trigger. The trigger exposes aria-expanded reflecting the open state and aria-controls pointing at the content region (a stable generated id); the content region is labelled by the trigger via aria-labelledby — the same wiring PixelAccordion uses.',
  },
  related: ['PixelAccordion', 'PixelTabs'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
