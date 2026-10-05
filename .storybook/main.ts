import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

// `title` names the manager page — "Pxlkit UI Kit for React - Storybook" —
// in place of the repository's package name; `managerHead` describes it.
const config: StorybookConfig & { title: string } = {
  title: 'Pxlkit UI Kit for React',
  managerHead: (head) => `${head}
    <meta name="description" content="Storybook of @pxlkit/ui-kit, the retro pixel-art UI kit for React, and the icon components of @pxlkit/core: every component's examples, with controls, docs and accessibility checks." />`,
  framework: '@storybook/react-vite',
  stories: [
    '../packages/ui-kit/src/**/*.stories.@(ts|tsx)',
    '../packages/core/src/**/*.stories.@(ts|tsx)',
  ],
  // Controls, actions, backgrounds, viewport and interactions ship in core
  // since Storybook 9; docs stays an addon and renders the autodocs pages.
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  async viteFinal(config) {
    // Tailwind v4 — required so ui-kit utility classes (text-retro-green, etc.) compile in Storybook
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
