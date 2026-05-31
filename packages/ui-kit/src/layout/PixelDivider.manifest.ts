import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { PixelDivider } from './PixelDivider'
import { Default, WithLabel, Tones, Spacings, Surfaces, PlainRule } from './PixelDivider.examples'

void PixelDivider

export default defineManifest({
  name: 'PixelDivider',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description: 'Horizontal rule with optional centered label; pixel surface adds dotted line and diamond ornaments.',
  highlights: [
    'Optional centered label between two rules',
    'Tone-aware label color via shared toneMap',
    'Symmetric vertical spacing presets (none/sm/md/lg)',
    'Pixel surface variant with dotted rule and ◆ ornaments',
    'Surface-aware: falls back to nearest <PxlKitSurface>',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-label', label: 'With Label', Component: WithLabel },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'spacings', label: 'Spacings', Component: Spacings },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'plain-rule', label: 'Plain Rule', Component: PlainRule },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['role=separator with aria-orientation=horizontal when labeled; decorative <hr> otherwise'],
    keyboard: [],
    notes: 'Non-interactive. When a label is present, the wrapper exposes role="separator" and aria-label; the underlying rules are aria-hidden.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
