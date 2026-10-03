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

/**
 * Compiles the kit the examples import. Suites that load examples run it in
 * `beforeAll`, so the first example to load does not pay, inside its own test
 * timeout, for compiling every component (seconds with coverage on).
 */
export async function loadKit(): Promise<void> {
  await import('@pxlkit/ui-kit-vue');
}

/**
 * The time `loadKit` may take: compiling every component with coverage on, on
 * a CI runner whose cores the other packages' suites share, can take more
 * than a minute. The limit only has to catch a hang.
 */
export const LOAD_KIT_TIMEOUT = 300_000;

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
