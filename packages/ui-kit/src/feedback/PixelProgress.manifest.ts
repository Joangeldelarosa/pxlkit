import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelProgress } from '../feedback';
import {
  Default,
  Tones,
  Surfaces,
  WithoutValue,
  WithoutLabel,
  Indeterminate,
  Clamped,
  Steps,
} from './PixelProgress.examples';

export default defineManifest({
  name: 'PixelProgress',
  category: 'feedback',
  since: '1.0.0',
  status: 'stable',
  description:
    'Determinate or indeterminate progress bar that renders as 10 segmented HP-bar blocks on the pixel surface and a smooth filled track on the linear surface.',
  highlights: [
    'Pixel surface renders an RPG-style 10-segment HP bar; linear surface renders a smooth filled track',
    'Seven tones via the shared toneMap palette',
    'Optional label + auto-rendered percentage, both individually toggleable',
    'Indeterminate mode for unknown-duration work (visual pulse + aria-busy)',
    'Input value is safely clamped to the [0, 100] range',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'without-value', label: 'Without value', Component: WithoutValue },
    { id: 'without-label', label: 'Without label', Component: WithoutLabel },
    { id: 'indeterminate', label: 'Indeterminate', Component: Indeterminate },
    { id: 'clamped', label: 'Clamped', Component: Clamped },
    { id: 'steps', label: 'Steps', Component: Steps },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['progressbar'],
    notes:
      'Exposes role="progressbar" with aria-valuemin=0 and aria-valuemax=100; aria-valuenow is set from the clamped value. The label prop is forwarded to aria-label, falling back to "Progress" when omitted so the progressbar always has an accessible name. In indeterminate mode aria-valuenow is omitted and aria-busy is set to true so assistive tech announces unknown-duration work. The 10-segment pixel surface is purely visual — assistive tech reads the same progressbar attributes as the linear surface.',
  },
  related: ['PixelSpinner', 'PixelSkeleton', 'PixelSlider'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
