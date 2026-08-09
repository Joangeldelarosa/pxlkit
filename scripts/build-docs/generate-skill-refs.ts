/**
 * generate-skill-refs — emits the agent-facing reference corpus under
 * `plugins/pxlkit/references/`.
 *
 * The pxlkit Claude Code plugin ships skills whose knowledge must never drift
 * from the ui-kit itself. Rather than hand-writing that knowledge, this step
 * derives every reference file from the SSOT (manifests + the ui-kit sources)
 * and stamps a `VERSION.json` carrying a content digest of the inputs. The
 * coherence gate `36-skill-refs-fresh` recomputes that digest and fails when
 * the committed references no longer match the sources.
 *
 * Outputs (all under plugins/pxlkit/references/):
 *   components/<category>.generated.md   one per COMPONENT_CATEGORIES entry
 *   tokens.generated.md                  tokens + theming reference
 *   setup.generated.md                   install / provider / Tailwind wiring
 *   recipes.generated.md                 composition skeletons
 *   diversity-menu.generated.md          per-component usage tiers
 *   icon-spec.generated.md               icon data format + authoring rules
 *   icon-shapes.generated.json           occupancy signatures for dup detection
 *   VERSION.json                         { uiKit, date, digestHash }
 *
 * SAFETY:
 *  - Every write is asserted to live under <repoRoot>/plugins/pxlkit/references.
 *    The step is read-only everywhere else in the repo; it never mutates the
 *    ui-kit sources it reads.
 *  - `date` comes from packages/ui-kit/version-meta.json, never Date.now(), so
 *    two builds of the same tree produce byte-identical output.
 *  - Renderers that have not landed yet (skill-refs/tokens, skill-refs/icons)
 *    are loaded dynamically and skipped with a warning instead of aborting the
 *    pipeline. The step is registered with `required: false` for the same
 *    reason: a missing reference must never block a release build.
 */

import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";

import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  type GeneratorWrite,
  type ManifestRecord,
} from "./_lib/generator-base.js";
import { COMPONENT_CATEGORIES, type Manifest } from "./manifest-schema.js";
import { renderComponentsDigest } from "./skill-refs/components.js";
import { renderDiversityMenu, type TemplateSources } from "./skill-refs/diversity.js";
import { renderRecipesReference } from "./skill-refs/recipes.js";
import { renderSetupReference } from "./skill-refs/setup.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Shape of the emitted VERSION.json.
 *
 * `plugin` and `uiKit` are deliberately separate. The plugin is its own artifact
 * with its own release cycle: a change to a SKILL.md or a validation script is a
 * real change users should be offered, and it happens without the kit moving at
 * all. Pinning the two together would make those releases invisible to the update
 * check, which is the one thing that check exists to prevent.
 *
 * `uiKit` records which version of the kit this digest was generated from, so a
 * consuming skill can tell whether its map still matches the territory.
 */
export interface SkillRefsVersionFile {
  /** The plugin's own version, mirrored from `.claude-plugin/plugin.json`. */
  plugin: string;
  /** The ui-kit version this reference corpus was generated from. */
  uiKit: string;
  date: string;
  digestHash: string;
}

export const REFERENCES_RELATIVE = "plugins/pxlkit/references";

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

/**
 * sha256 over a keyed input set, order-independent.
 *
 * Keys are sorted so callers may build the record in any order, and both key
 * and value are terminated with a NUL byte so that `{ab: 'c'}` and
 * `{a: 'bc'}` cannot collide.
 *
 * The coherence gate 36-skill-refs-fresh calls this with the same inputs; any
 * change to the framing here must be mirrored there or every build goes stale.
 */
export function computeDigestHash(inputs: Record<string, string>): string {
  const hash = createHash("sha256");
  for (const key of Object.keys(inputs).sort()) {
    hash.update(key);
    hash.update("\0");
    hash.update(inputs[key] ?? "");
    hash.update("\0");
  }
  return hash.digest("hex");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

export function referencesRoot(repoRoot: string): string {
  return toPosix(path.join(repoRoot, REFERENCES_RELATIVE));
}

/**
 * Guard the read-only contract: the whole point of this step is that it reads
 * the repo and writes exactly one directory. A renderer that returned a stray
 * path would otherwise silently clobber source files.
 */
export function assertSafeOutputPath(repoRoot: string, outPath: string): void {
  const allowed = referencesRoot(repoRoot);
  const resolved = toPosix(path.resolve(outPath));
  if (resolved !== allowed && !resolved.startsWith(`${allowed}/`)) {
    throw new Error(
      `generate-skill-refs: refusing to write outside ${REFERENCES_RELATIVE} (got ${resolved})`,
    );
  }
}

async function readIfPresent(file: string): Promise<string> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}

/**
 * Deterministic JSON: object keys sorted recursively, functions and other
 * non-serializable values collapsed to a stable marker. Manifests may carry a
 * React component reference; JSON.stringify would drop it silently and make
 * the digest blind to a whole class of change.
 */
export function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  const t = typeof value;
  if (t === "function") return `"[function ${(value as { name?: string }).name || "anonymous"}]"`;
  if (t === "number" || t === "boolean") return String(value);
  if (t === "bigint") return `"${String(value)}"`;
  if (t === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const body = keys
    .filter((k) => obj[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",");
  return `{${body}}`;
}

/** Serialize the manifest set into one deterministic digest input. */
export function serializeManifests(records: ManifestRecord[]): string {
  const sorted = [...records].sort((a, b) =>
    String(a.manifest?.name ?? "").localeCompare(String(b.manifest?.name ?? "")),
  );
  return stableStringify(sorted.map((r) => r.manifest));
}

interface VersionMeta {
  version: string;
  date: string;
}

/**
 * Version + date come from packages/ui-kit/version-meta.json. The date is a
 * release fact, not a build fact: using Date.now() here would make every build
 * dirty the working tree and defeat the freshness gate.
 */
export async function readVersionMeta(repoRoot: string): Promise<VersionMeta> {
  const metaPath = path.join(repoRoot, "packages/ui-kit/version-meta.json");
  const meta = (await fs.readJson(metaPath)) as Partial<VersionMeta>;
  if (typeof meta.version !== "string" || meta.version.length === 0) {
    throw new Error(`generate-skill-refs: ${toPosix(metaPath)} has no "version"`);
  }
  if (typeof meta.date !== "string" || meta.date.length === 0) {
    throw new Error(`generate-skill-refs: ${toPosix(metaPath)} has no "date"`);
  }
  return { version: meta.version, date: meta.date };
}

/** Read every page template as `basename -> source`, the oracle for recipes/diversity. */
async function readTemplateSources(repoRoot: string): Promise<TemplateSources> {
  const dir = path.join(repoRoot, "apps/web/src/components/templates");
  const out: TemplateSources = {};
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return out;
  }
  for (const entry of entries.sort()) {
    if (!/\.[jt]sx?$/.test(entry)) continue;
    out[entry] = await readIfPresent(path.join(dir, entry));
  }
  return out;
}

/**
 * Import a renderer that may not exist yet (Tasks A3/A5 land in parallel).
 * Returns null on any resolution failure so the step degrades instead of
 * aborting. A genuine syntax error inside a landed module also lands here —
 * hence the warning carries the underlying message.
 */
async function loadOptionalModule<T>(
  specifier: string,
  logger: GeneratorContext["logger"],
): Promise<T | null> {
  try {
    return (await import(specifier)) as T;
  } catch (err) {
    logger.warn(
      `generate-skill-refs: ${specifier} unavailable — ${(err as Error).message.split("\n")[0]}`,
    );
    return null;
  }
}

interface TokensModule {
  renderTokensReference: (
    sources: { tokensTs: string; commonTsx: string; stylesCss: string },
    version: string,
  ) => string;
}

interface IconsModule {
  renderIconSpec: (version: string) => string;
  buildIconShapes: () => Promise<unknown[]>;
}

// ---------------------------------------------------------------------------
// The step
// ---------------------------------------------------------------------------

/**
 * Build every skill reference and return the writes. Pure with respect to the
 * filesystem apart from reads — the orchestrator flushes the writes.
 */
export async function generateSkillRefs(ctx: GeneratorContext): Promise<GeneratorResult> {
  const { repoRoot, logger } = ctx;
  const root = referencesRoot(repoRoot);
  const { version, date } = await readVersionMeta(repoRoot);

  // --- read sources -------------------------------------------------------
  const registryPath = toPosix(path.join(repoRoot, "packages/ui-kit/src/registry.generated.ts"));
  const tokensPath = path.join(repoRoot, "packages/ui-kit/src/tokens.ts");
  const commonPath = path.join(repoRoot, "packages/ui-kit/src/common.tsx");
  const stylesPath = path.join(repoRoot, "packages/ui-kit/styles.css");
  const coreTypesPath = path.join(repoRoot, "packages/core/src/types.ts");

  // Prefer the in-memory registry produced by generate-registry earlier in the
  // same run: on a --dry-run it is the only copy, and on a real run it is the
  // one the digest must describe.
  const registryTs = ctx.outputs.get(registryPath) ?? (await readIfPresent(registryPath));

  const [tokensTs, commonTsx, stylesCss, coreTypesTs] = await Promise.all([
    readIfPresent(tokensPath),
    readIfPresent(commonPath),
    readIfPresent(stylesPath),
    readIfPresent(coreTypesPath),
  ]);

  const manifestsJson = serializeManifests(ctx.manifests);
  const templateSources = await readTemplateSources(repoRoot);

  // --- render -------------------------------------------------------------
  // ctx.manifests carries the permissive loader shape; the renderers consume
  // the manifest-schema contract. Same objects at runtime — the manifests were
  // authored through defineManifest().
  const manifests = ctx.manifests.map((r) => r.manifest) as unknown as Manifest[];

  const writes: GeneratorWrite[] = [];
  const add = (relative: string, content: string): void => {
    const outPath = toPosix(path.join(root, relative));
    assertSafeOutputPath(repoRoot, outPath);
    writes.push({ path: outPath, content });
  };

  for (const category of COMPONENT_CATEGORIES) {
    add(`components/${category}.generated.md`, renderComponentsDigest(manifests, category, version));
  }

  add("setup.generated.md", renderSetupReference(version));
  add("recipes.generated.md", renderRecipesReference(templateSources, version));
  add("diversity-menu.generated.md", renderDiversityMenu(manifests, templateSources, version));

  const tokensMod = await loadOptionalModule<TokensModule>("./skill-refs/tokens.js", logger);
  if (tokensMod?.renderTokensReference) {
    add(
      "tokens.generated.md",
      tokensMod.renderTokensReference({ tokensTs, commonTsx, stylesCss }, version),
    );
  }

  const iconsMod = await loadOptionalModule<IconsModule>("./skill-refs/icons.js", logger);
  if (iconsMod?.renderIconSpec) {
    add("icon-spec.generated.md", iconsMod.renderIconSpec(version));
  }
  if (iconsMod?.buildIconShapes) {
    try {
      const shapes = await iconsMod.buildIconShapes();
      add("icon-shapes.generated.json", `${JSON.stringify(shapes, null, 2)}\n`);
    } catch (err) {
      logger.warn(`generate-skill-refs: buildIconShapes failed — ${(err as Error).message}`);
    }
  }

  // --- VERSION.json -------------------------------------------------------
  const digestHash = computeDigestHash({
    registry: registryTs,
    tokens: tokensTs,
    common: commonTsx,
    styles: stylesCss,
    coreTypes: coreTypesTs,
    manifests: manifestsJson,
  });

  // The plugin's own version is mirrored from its manifest rather than derived from
  // the kit: the two move independently, and gate 36 checks each chain separately.
  const pluginManifestRaw = await readIfPresent(
    path.join(repoRoot, "plugins/pxlkit/.claude-plugin/plugin.json"),
  );
  let pluginVersion = version;
  if (pluginManifestRaw) {
    try {
      const parsed = JSON.parse(pluginManifestRaw) as { version?: string };
      if (typeof parsed.version === "string") pluginVersion = parsed.version;
    } catch {
      logger.warn(
        "generate-skill-refs: plugin.json is not valid JSON — falling back to the ui-kit version",
      );
    }
  }

  const versionFile: SkillRefsVersionFile = {
    plugin: pluginVersion,
    uiKit: version,
    date,
    digestHash,
  };
  add("VERSION.json", `${JSON.stringify(versionFile, null, 2)}\n`);

  logger.info(
    `generate-skill-refs: ${manifests.length} manifests → ${writes.length} reference file(s) @ v${version}`,
  );

  return { writes };
}

export class GenerateSkillRefsGenerator extends Generator {
  name = "generate-skill-refs";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const result = await generateSkillRefs(ctx);
    for (const w of result.writes) ctx.outputs.set(w.path, w.content);
    return result;
  }
}

export default GenerateSkillRefsGenerator;

// ---------------------------------------------------------------------------
// CLI — `tsx scripts/build-docs/generate-skill-refs.ts` is not the supported
// entry point (the step needs ctx.manifests from `scan`); run the orchestrator
// with `--only=skill-refs` instead. Guard kept so importing stays side-effect
// free either way.
// ---------------------------------------------------------------------------

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  (() => {
    try {
      return import.meta.url === pathToFileURL(process.argv[1] as string).href;
    } catch {
      return false;
    }
  })();

if (invokedDirectly) {
  // eslint-disable-next-line no-console
  console.error(
    "generate-skill-refs needs the scan step; run: npm run docs:build -- --only=skill-refs",
  );
  process.exit(1);
}
