/**
 * The React kit's examples, enumerated from the component manifests — the
 * reference every other framework's examples are compared against.
 */
/// <reference types="vite/client" />
import type { ComponentType } from 'react';

export interface ReactExample {
  /** Manifest category (`actions`, `forms`, …) — also the source folder. */
  category: string;
  /** Component name (`PixelButton`). */
  component: string;
  /** Manifest example id (`with-icons`). */
  id: string;
  /** Manifest example label (`With icons`). */
  label: string;
  /** Name of the example's export in `<Component>.examples.tsx` (`WithIcons`). */
  exportName: string;
  /** The React example. */
  Component: ComponentType;
}

interface ManifestExample {
  id: string;
  label: string;
  Component: ComponentType;
}

interface ManifestShape {
  name: string;
  category: string;
  examples?: ManifestExample[];
}

const manifests = import.meta.glob<{ default: ManifestShape }>('../../packages/ui-kit/src/*/*.manifest.ts', {
  eager: true,
});
const exampleModules = import.meta.glob<Record<string, unknown>>('../../packages/ui-kit/src/*/*.examples.tsx', {
  eager: true,
});

function examplesModuleOf(manifestPath: string): Record<string, unknown> {
  const path = manifestPath.replace(/\.manifest\.ts$/, '.examples.tsx');
  const mod = exampleModules[path];
  if (!mod) throw new Error(`No examples module next to ${manifestPath}`);
  return mod;
}

/** Every manifest example, ordered by component then manifest order. */
export function reactExamples(): ReactExample[] {
  const out: ReactExample[] = [];
  for (const path of Object.keys(manifests).sort()) {
    const manifest = manifests[path]!.default;
    const mod = examplesModuleOf(path);
    for (const example of manifest.examples ?? []) {
      const exportName = Object.keys(mod).find((key) => mod[key] === example.Component);
      if (!exportName) {
        throw new Error(`${manifest.name}: example "${example.id}" is not an export of its examples module`);
      }
      out.push({
        category: manifest.category,
        component: manifest.name,
        id: example.id,
        label: example.label,
        exportName,
        Component: example.Component,
      });
    }
  }
  return out;
}

/** Component name → manifest category, for every component with a manifest. */
export function componentCategories(): Map<string, string> {
  const out = new Map<string, string>();
  for (const path of Object.keys(manifests)) {
    const manifest = manifests[path]!.default;
    out.set(manifest.name, manifest.category);
  }
  return out;
}
