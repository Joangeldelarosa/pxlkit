import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitLocaleProvider } from '../locale';
import { Default, Turkish } from './PxlKitLocaleProvider.examples';

void PxlKitLocaleProvider;

export default defineManifest({
  name: 'PxlKitLocaleProvider',
  category: 'overlay-foundation',
  since: '1.6.0',
  status: 'stable',
  description:
    'Provides locale-aware font loading and text utilities (upper/lower) to all PxlKit components via context.',
  highlights: [
    'Sets lang on a wrapper so CSS text-transform handles Turkish i → İ correctly',
    'Builds Google Fonts URL with the correct subsets (latin-ext for Turkish)',
    'Exposes locale-aware upper() and lower() helpers via usePxlKitLocale()',
    'Supports BCP 47 locales en and tr out of the box',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'turkish', label: 'Turkish', Component: Turkish },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['sets lang/dir context for descendants; no direct ARIA'],
    keyboard: [],
    notes:
      'Wraps children in a div with lang={locale} so assistive tech and CSS text-transform pick up the correct language. For Next.js apps, also set lang on the <html> tag.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
