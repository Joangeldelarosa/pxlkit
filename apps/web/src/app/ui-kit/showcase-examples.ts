/**
 * The example each component's section on /ui-kit shows as code, in React,
 * Vue and Angular: the id of one of its manifest's examples, for the
 * components whose first example (their usage lead on /docs) shows less of
 * them than another does. The others show their first example.
 *
 * `npm run docs:build` reads this when it writes the usage-snippet modules
 * (`docs/sections/usage-snippets*.generated.ts`), and fails on a component or
 * an example no manifest has. Plain data: the build imports it outside Next.
 */
export const SHOWCASE_EXAMPLES: Readonly<Record<string, string>> = {
  'pixel-alert': 'with-action',
  'pixel-button': 'with-icons',
  'pixel-card': 'with-footer',
  'pixel-chip': 'deletable',
  'pixel-empty-state': 'with-icon-and-action',
  'pixel-split-button': 'with-callbacks',
};
