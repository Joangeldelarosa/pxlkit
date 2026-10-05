import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitLocaleProvider } from './PxlKitLocaleProvider';
import { Default, Turkish } from './PxlKitLocaleProvider.examples';

void PxlKitLocaleProvider;

export default defineManifest({
  name: 'PxlKitLocaleProvider',
  category: 'overlay-foundation',
  since: '1.6.0',
  status: 'stable',
  description:
    'Sets the locale for every nested PxlKit component: lang on a layout-neutral wrapper, locale-aware upper/lower helpers and the matching Google Fonts URL.',
  highlights: [
    'Sets lang on a wrapper so CSS text-transform handles Turkish i → İ correctly',
    'Builds Google Fonts URL with the correct subsets (latin-ext for Turkish)',
    'Exposes locale-aware upper() and lower() helpers via usePxlKitLocale() (injectPxlKitLocale() in Angular)',
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
      'Wraps its content in a layout-neutral element carrying `lang` (in Angular, the host element) so assistive tech and CSS text-transform pick up the correct language. In server-rendered apps (Next.js, Nuxt, Angular SSR), also set lang on the <html> tag.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
