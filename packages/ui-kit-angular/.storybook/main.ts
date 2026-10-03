import type { StorybookConfig } from '@storybook/angular';

// The Angular kit's stories (generated from its examples by `npm run
// docs:build`) under the React Storybook's titles and names. This folder is
// the Angular workspace the Storybook builders run in (angular.json), so its
// PostCSS configuration — Tailwind CSS for the kit's classes — stays out of
// the library build: `npm run storybook` here (port 6008), or
// `npm run storybook:angular` from the root.
const config: StorybookConfig = {
  framework: { name: '@storybook/angular', options: {} },
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
};

export default config;
