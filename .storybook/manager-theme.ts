import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

/**
 * The sidebar's brand in the React, Vue and Angular Storybooks: the kit's
 * name for the framework, linking to its page on pxlkit.xyz, on the dark
 * theme the stories render on. Each Storybook's `manager.ts` calls it.
 */
export function brandStorybook(brandTitle: string, brandUrl: string): void {
  addons.setConfig({
    theme: create({ base: 'dark', brandTitle, brandUrl }),
  });
}
