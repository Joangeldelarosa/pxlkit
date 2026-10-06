import type { StorybookConfig } from '@storybook/vue3-vite';

// The Vue kit's stories (generated from its examples by `npm run docs:build`)
// under the React Storybook's titles and names. Run from this package:
// `npm run storybook` (port 6007), or `npm run storybook:vue` from the root.
// `title` names the manager page — "Pxlkit UI Kit for Vue 3 - Storybook";
// `managerHead` describes it.
const config: StorybookConfig & { title: string } = {
  title: 'Pxlkit UI Kit for Vue 3',
  managerHead: (head) => `${head}
    <meta name="description" content="Storybook of @pxlkit/ui-kit-vue, the Vue 3 edition of the Pxlkit retro pixel-art UI kit for React: every component's examples, with docs and accessibility checks." />`,
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
