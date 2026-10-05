import type { StorybookConfig } from '@storybook/angular';

// The Angular kit's stories (generated from its examples by `npm run
// docs:build`) under the React Storybook's titles and names. This folder is
// the Angular workspace the Storybook builders run in (angular.json), so its
// PostCSS configuration — Tailwind CSS for the kit's classes — stays out of
// the library build: `npm run storybook` here (port 6008), or
// `npm run storybook:angular` from the root.
// `title` names the manager page — "Pxlkit UI Kit for Angular - Storybook";
// `managerHead` describes it.
const config: StorybookConfig & { title: string } = {
  title: 'Pxlkit UI Kit for Angular',
  managerHead: (head) => `${head}
    <meta name="description" content="Storybook of @pxlkit/ui-kit-angular, the Angular edition of the Pxlkit retro pixel-art UI kit for React: every component's examples, with docs and accessibility checks." />`,
  framework: { name: '@storybook/angular', options: {} },
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
};

export default config;
