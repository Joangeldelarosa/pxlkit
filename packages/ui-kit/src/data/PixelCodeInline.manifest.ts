import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCodeInline } from './PixelCodeInline';
import {
  Default,
  Tones,
  Surfaces,
  InlineInProse,
  CodeSamples,
} from './PixelCodeInline.examples';

void PixelCodeInline;

export default defineManifest({
  name: 'PixelCodeInline',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Inline <code> element with tone tinting and surface-aware framing for highlighting commands, identifiers, and short snippets in flowing prose.',
  highlights: [
    'Semantic <code> root so assistive tech announces the inline-code role.',
    'Tone-tinted border, background, and text for at-a-glance categorisation (neutral, cyan, green, gold, red, purple, pink).',
    'Surface-aware: pixel chamfered border + pixel font, or linear pill.',
    'Composable inline — accepts any ReactNode children for icons or multi-token snippets.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'inline-in-prose', label: 'Inline in Prose', Component: InlineInProse },
    { id: 'code-samples', label: 'Code Samples', Component: CodeSamples },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['code'],
    notes:
      'Renders as a native <code> element so screen readers convey the inline-code semantic. PixelCodeInline is presentational (not focusable, not actionable) — tone is purely decorative, so the surrounding prose must carry the meaning (e.g. mark error snippets with adjacent text, not tone alone). For multi-line code blocks use a block-level <pre><code> primitive instead.',
  },
  related: ['PixelKbd'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
