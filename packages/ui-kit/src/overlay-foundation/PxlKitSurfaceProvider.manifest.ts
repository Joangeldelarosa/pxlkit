import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitSurfaceProvider } from './PxlKitSurfaceProvider';
import { Default, Linear, Override } from './PxlKitSurfaceProvider.examples';

void PxlKitSurfaceProvider;

export default defineManifest({
  name: 'PxlKitSurfaceProvider',
  category: 'overlay-foundation',
  since: '1.6.0',
  status: 'stable',
  description:
    'Sets the default surface (pixel | linear) for every nested PxlKit component — React context, Vue provide/inject or Angular dependency injection.',
  highlights: [
    'Switches the entire subtree between the pixel and linear aesthetics in one line',
    'Per-component surface prop still overrides the provider for one-off variants',
    'Defaults to "pixel" so consumers without a provider keep the brand look',
    'Renders no element of its own and is safe for server rendering',
  ],
  examples: [
    { id: 'default', label: 'Default (Pixel)', Component: Default },
    { id: 'linear', label: 'Linear', Component: Linear },
    { id: 'override', label: 'Per-component override', Component: Override },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['theme/surface context provider; respects color-scheme via theme tokens'],
    keyboard: [],
    notes:
      'Visual-only context provider — does not render interactive DOM and does not affect focus order or ARIA semantics of descendants.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
