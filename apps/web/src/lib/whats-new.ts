import type { WhatsNewItem } from '@/components/whats-new-strip';

/**
 * The 2.2.0 highlights both "What's new" strips show — on the home page and
 * on /ui-kit: the React kit's Vue and Angular editions, the icon components
 * for both, and the core the kits share. The coherence audit (gate 34) checks
 * these names against the release's "Added" entries in the root CHANGELOG.
 */
export const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  { name: '@pxlkit/ui-kit-vue', category: 'vue', href: '/ui-kit#vue', isNew: true },
  { name: '@pxlkit/ui-kit-angular', category: 'angular', href: '/ui-kit#angular', isNew: true },
  { name: '@pxlkit/vue', category: 'icons', href: '/docs#icon-component', isNew: true },
  { name: '@pxlkit/angular', category: 'icons', href: '/docs#icon-component', isNew: true },
  { name: '@pxlkit/ui-kit-core', category: 'core', href: '/ui-kit#getting-started', isNew: true },
];

/** The release in one line, above the items. */
export const WHATS_NEW_SUMMARY = 'The React kit, now in Vue and Angular — the same components, markup and behaviour.';
