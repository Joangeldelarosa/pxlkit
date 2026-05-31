import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Logger } from "./logger.js";
import { defaultLogger } from "./logger.js";

/**
 * Permissive manifest shape. Generators may narrow it to their own contract.
 * Authored next to each component as <Component>.manifest.ts and exported as
 * either `default` or a named `manifest` export.
 */
export interface Manifest {
  name: string;
  description?: string;
  category?: string;
  status?: "stable" | "beta" | "experimental" | "deprecated";
  since?: string;
  deprecated?: { since?: string; replacement?: string; note?: string } | boolean;
  tags?: string[];
  props?: Array<{
    name: string;
    type?: string;
    required?: boolean;
    default?: unknown;
    description?: string;
  }>;
  examples?: Array<{ name: string; code?: string; description?: string }>;
  related?: string[];
  // Generators may attach extra fields; keep this open-ended.
  [extra: string]: unknown;
}

export interface ManifestRecord {
  manifest: Manifest;
  /** Absolute POSIX path to the component .tsx file. */
  sourceFile: string;
  /** Absolute POSIX path to the manifest .ts file. */
  manifestFile: string;
  /** Absolute POSIX path to the examples file, if a sibling *.examples.tsx exists. */
  examplesFile?: string;
  /** Workspace package name (e.g. "@pxlkit/ui-kit"). */
  package: string;
}

export interface GeneratorContext {
  repoRoot: string;
  manifests: ManifestRecord[];
  /**
   * Shared output map keyed by absolute output path. Generators read/write to
   * collaborate (e.g. an index generator aggregating per-component pages).
   */
  outputs: Map<string, string>;
  logger: Logger;
}

export interface GeneratorWrite {
  path: string;
  content: string;
}

export interface GeneratorResult {
  writes: GeneratorWrite[];
}

export abstract class Generator {
  abstract name: string;
  abstract run(ctx: GeneratorContext): Promise<GeneratorResult>;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

/**
 * fs-extra ensureDir + writeFile. Always UTF-8.
 */
export async function writeOutput(outPath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, content, "utf8");
}

function deriveManifestPath(tsxFile: string): string {
  const dir = path.dirname(tsxFile);
  const base = path.basename(tsxFile, ".tsx");
  return path.join(dir, `${base}.manifest.ts`);
}

function deriveExamplesPath(tsxFile: string): string {
  const dir = path.dirname(tsxFile);
  const base = path.basename(tsxFile, ".tsx");
  return path.join(dir, `${base}.examples.tsx`);
}

async function detectPackageName(file: string): Promise<string> {
  let dir = path.dirname(file);
  const root = path.parse(dir).root;
  while (dir && dir !== root) {
    const pkgPath = path.join(dir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      try {
        const pkg = (await fs.readJson(pkgPath)) as { name?: string };
        if (pkg && typeof pkg.name === "string" && pkg.name.length > 0) {
          return pkg.name;
        }
      } catch {
        // ignore and keep walking up
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "unknown";
}

function isManifestLike(value: unknown): value is Manifest {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/**
 * Dynamically import a *.manifest.ts file and return a ManifestRecord.
 * Returns null if the file cannot be loaded or does not export a manifest.
 *
 * NOTE: meant to be invoked under `tsx` so .ts imports resolve at runtime.
 */
export async function readManifest(file: string): Promise<ManifestRecord | null> {
  const manifestFile = file.endsWith(".manifest.ts") ? file : deriveManifestPath(file);
  const sourceFile = manifestFile.replace(/\.manifest\.ts$/, ".tsx");

  if (!(await fs.pathExists(manifestFile))) {
    return null;
  }
  if (!(await fs.pathExists(sourceFile))) {
    return null;
  }

  let mod: Record<string, unknown>;
  try {
    mod = (await import(pathToFileURL(manifestFile).href)) as Record<string, unknown>;
  } catch (err) {
    defaultLogger.warn(
      `readManifest: failed to import ${toPosix(manifestFile)}: ${(err as Error).message}`,
    );
    return null;
  }

  const candidate =
    (mod.default as unknown) ?? (mod.manifest as unknown) ?? (mod as unknown);
  if (!isManifestLike(candidate)) {
    return null;
  }

  const examplesPath = deriveExamplesPath(sourceFile);
  const examplesFile = (await fs.pathExists(examplesPath)) ? toPosix(examplesPath) : undefined;
  const pkg = await detectPackageName(sourceFile);

  return {
    manifest: candidate,
    sourceFile: toPosix(sourceFile),
    manifestFile: toPosix(manifestFile),
    examplesFile,
    package: pkg,
  };
}

export type { Logger } from "./logger.js";
export { createLogger, defaultLogger } from "./logger.js";
