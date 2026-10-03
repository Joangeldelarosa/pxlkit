import type { StorybookConfig } from '@storybook/vue3-vite';

// The Vue kit's stories (generated from its examples by `npm run docs:build`)
// under the React Storybook's titles and names. Run from this package:
// `npm run storybook` (port 6007), or `npm run storybook:vue` from the root.
const config: StorybookConfig = {
  framework: {
    name: '@storybook/vue3-vite',
    // Props tables from the components' TypeScript types.
    options: { docgen: 'vue-component-meta' },
  },
  core: {
    // Storybook's own Vite config: the package's vite.config.ts builds the library.
    builder: { name: '@storybook/builder-vite', options: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
};

export default config;
