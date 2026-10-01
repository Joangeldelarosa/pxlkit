/**
 * The Angular examples, keyed like the React reference: `<Component>/<Export>`.
 * Each component's examples are the exported classes of
 * `examples/<category>/<component-file>.examples.ts`. The names are read from
 * the sources; a module is loaded only by the tests that use it, so one broken
 * example file fails its own tests only.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Type } from '@angular/core';

const loaders = import.meta.glob<Record<string, unknown>>('../../examples/*/*.examples.ts');

/** `pixel-button` → `PixelButton`, `pxl-kit-toast-provider` → `PxlKitToastProvider`. */
export function componentName(file: string): string {
  return file.replace(/(^|-)([a-z0-9])/g, (_m, _dash, char: string) => char.toUpperCase());
}

export interface AngularExample {
  category: string;
  component: string;
  exportName: string;
  load: () => Promise<Type<unknown>>;
}

/**
 * Compiles the kit the examples import. Suites that load examples run it in
 * `beforeAll`, so the first example to load does not pay, inside its own test
 * timeout, for compiling every component (seconds with coverage on).
 */
export async function loadKit(): Promise<void> {
  await import('@pxlkit/ui-kit-angular');
}

export const angularExamples: ReadonlyMap<string, AngularExample> = new Map(
  Object.entries(loaders).flatMap(([path, loader]) => {
    const [, category, file] = /examples\/([^/]+)\/([^/]+)\.examples\.ts$/.exec(path)!;
    const component = componentName(file!);
    const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
    return Array.from(source.matchAll(/^export class (\w+)/gm), ([, exportName]) => [
      `${component}/${exportName}`,
      {
        category: category!,
        component,
        exportName: exportName!,
        load: async () => {
          const Example = (await loader())[exportName!];
          if (typeof Example !== 'function') throw new Error(`${path} does not export a class ${exportName}`);
          return Example as Type<unknown>;
        },
      },
    ]);
  }),
);
