/**
 * The Vue and Angular ports of the UI kit, and which React components each one
 * implements (ADR-0006). A port's examples mirror the React manifest examples
 * one for one, so a component counts as ported when every one of its manifest
 * examples exists in the port:
 *
 *   Vue      packages/ui-kit-vue/examples/<category>/<Component>/<Export>.vue
 *   Angular  packages/ui-kit-angular/examples/<category>/<component-kebab>.examples.ts
 *            (one exported class per example, named like the React export)
 */
import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ManifestRecord } from "./generator-base.js";

export type PortFramework = "vue" | "angular";

export interface KitPort {
  framework: PortFramework;
  /** npm package name. */
  package: string;
  /** Package directory, relative to the repository root. */
  dir: string;
}

export const KIT_PORTS: readonly KitPort[] = [
  { framework: "vue", package: "@pxlkit/ui-kit-vue", dir: "packages/ui-kit-vue" },
  { framework: "angular", package: "@pxlkit/ui-kit-angular", dir: "packages/ui-kit-angular" },
];

/** `PxlKitSurfaceProvider` → `pxl-kit-surface-provider`. */
export function kebabCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Export names of a component's manifest examples, in manifest order — the
 * names its ports give their examples. Read by identity from the examples
 * module, as the parity harness does.
 */
export async function manifestExampleExports(record: ManifestRecord): Promise<string[]> {
  if (!record.examplesFile) return [];
  // The manifest module itself, not `record.manifest`: validation may hand
  // generators a copy whose example components are no longer the exports.
  const manifestModule = (await import(pathToFileURL(record.manifestFile).href)) as Record<string, unknown>;
  const manifest = (manifestModule.default ?? manifestModule.manifest) as { examples?: Array<{ Component?: unknown }> };
  const examples = manifest.examples ?? [];
  const mod = (await import(pathToFileURL(record.examplesFile).href)) as Record<string, unknown>;
  return examples.map((example) => {
    const name = Object.keys(mod).find((key) => mod[key] === example.Component);
    if (!name) throw new Error(`${record.manifest.name}: a manifest example is not an export of ${record.examplesFile}`);
    return name;
  });
}

/** Component name → the example exports a port implements. */
export async function portExamples(repoRoot: string, port: KitPort): Promise<Map<string, Set<string>>> {
  const root = path.join(repoRoot, port.dir, "examples");
  const out = new Map<string, Set<string>>();
  if (!(await fs.pathExists(root))) return out;
  for (const category of (await fs.readdir(root)).sort()) {
    const categoryDir = path.join(root, category);
    if (!(await fs.stat(categoryDir)).isDirectory()) continue;
    if (port.framework === "vue") {
      for (const component of (await fs.readdir(categoryDir)).sort()) {
        const componentDir = path.join(categoryDir, component);
        if (!(await fs.stat(componentDir)).isDirectory()) continue;
        const files = (await fs.readdir(componentDir)).filter((file) => file.endsWith(".vue"));
        out.set(component, new Set(files.map((file) => file.slice(0, -".vue".length))));
      }
    } else {
      for (const file of (await fs.readdir(categoryDir)).sort()) {
        if (!file.endsWith(".examples.ts")) continue;
        const source = await fs.readFile(path.join(categoryDir, file), "utf8");
        const classes = Array.from(source.matchAll(/^export class (\w+)/gm), (match) => match[1]!);
        out.set(file.slice(0, -".examples.ts".length), new Set(classes));
      }
    }
  }
  return out;
}

/**
 * The manifests a port implements in full — every manifest example present.
 * Angular example files are keyed by the kebab-case component name.
 */
export async function portedManifests(
  repoRoot: string,
  port: KitPort,
  manifests: ManifestRecord[],
): Promise<ManifestRecord[]> {
  const examples = await portExamples(repoRoot, port);
  const out: ManifestRecord[] = [];
  for (const record of manifests) {
    const key = port.framework === "vue" ? record.manifest.name : kebabCase(record.manifest.name);
    const implemented = examples.get(key);
    if (!implemented) continue;
    const expected = await manifestExampleExports(record);
    if (expected.length > 0 && expected.every((name) => implemented.has(name))) out.push(record);
  }
  return out;
}
