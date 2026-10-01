/**
 * The Vue examples, keyed like the React reference: `<Component>/<Export>`.
 * Each lives in `examples/<category>/<Component>/<Export>.vue` and is loaded
 * on demand, so one broken example fails its own tests only.
 */
import type { Component } from 'vue';

const loaders = import.meta.glob<{ default: Component }>('../../examples/*/*/*.vue');

export interface VueExample {
  category: string;
  component: string;
  exportName: string;
  load: () => Promise<Component>;
}

export const vueExamples: ReadonlyMap<string, VueExample> = new Map(
  Object.entries(loaders).map(([path, loader]) => {
    const [, category, component, file] = /examples\/([^/]+)\/([^/]+)\/([^/]+)\.vue$/.exec(path)!;
    return [
      `${component}/${file}`,
      {
        category: category!,
        component: component!,
        exportName: file!,
        load: async () => (await loader()).default,
      },
    ];
  }),
);
