/**
 * Gate 36 — skill-refs-fresh
 *
 * The pxlkit Claude Code plugin ships a generated reference corpus under
 * `plugins/pxlkit/references/`. Those files are the only thing the skills know
 * about the ui-kit, so a stale corpus is worse than no corpus: the agent would
 * confidently emit props that no longer exist. This gate is the tripwire.
 *
 * Three independent checks, all `major`:
 *
 *   (a) Freshness — recompute the content digest over the same sources
 *       `generate-skill-refs` hashes and compare it with the committed
 *       `VERSION.json`. Divergence means the references were not regenerated
 *       after a source change.
 *   (b) Version coherence — `plugin.json`, the plugin's entry in
 *       `.claude-plugin/marketplace.json`, and `references/VERSION.json` must
 *       all declare the same version. A marketplace that advertises 2.1.0
 *       while shipping 2.1.1 references is a silently wrong install.
 *   (c) Pixelate map — every `Pixel*` / `PxlKit*` symbol cited in
 *       `references/pixelate-map.md` must actually be exported by pxlkit, from
 *       either the ui-kit or core (the map spans both; see `readKnownSymbols`).
 *
 * `computeDigestHash` and `serializeManifests` are imported from the generator
 * rather than reimplemented: two copies of a hashing convention drift, and the
 * failure mode (every build reported stale) is indistinguishable from the bug
 * this gate exists to catch.
 *
 * Absent inputs are treated as "not this gate's business" rather than as
 * findings, with one exception: a references directory that exists but has no
 * VERSION.json is a corpus that cannot be verified, and that is reported.
 * `pixelate-map.md` in particular is authored by a later task and its absence
 * must never fail the audit.
 *
 * Safety: read-only. The gate never writes.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { DriftItem, Gate, GateResult } from '../types';
import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';
import {
  computeDigestHash,
  serializeManifests,
} from '../../build-docs/generate-skill-refs.js';
import { scanManifests } from '../../build-docs/scan-manifests.js';
import type { Logger } from '../../build-docs/_lib/logger.js';

const GATE_ID = '36-skill-refs-fresh';
const DESCRIPTION =
  'plugins/pxlkit/references must be regenerated from the ui-kit SSOT (digest match), plugin.json / marketplace.json / VERSION.json must declare the same version, and every component cited in pixelate-map.md must exist in the ui-kit or core.';

/** Exact remediation, appended verbatim to the stale-digest finding. */
export const REGENERATE_HINT =
  'run npm run docs:build and commit the regenerated references';

const REFERENCES_DIR = 'plugins/pxlkit/references';
const VERSION_JSON = `${REFERENCES_DIR}/VERSION.json`;
const PIXELATE_MAP = `${REFERENCES_DIR}/pixelate-map.md`;
const PLUGIN_JSON = 'plugins/pxlkit/.claude-plugin/plugin.json';
const MARKETPLACE_JSON = '.claude-plugin/marketplace.json';

// ---------------------------------------------------------------------------
// IO helpers
// ---------------------------------------------------------------------------

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/** Mirrors the generator's `readIfPresent`: a missing source hashes as "". */
async function readOrEmpty(path: string): Promise<string> {
  return (await tryRead(path)) ?? '';
}

async function tryReadJson<T>(path: string): Promise<T | null> {
  const raw = await tryRead(path);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** scanManifests is chatty by default; the audit runner owns the console. */
const SILENT_LOGGER: Logger = {
  info() {},
  warn() {},
  error() {},
  success() {},
  table() {},
};

// ---------------------------------------------------------------------------
// (a) Digest
// ---------------------------------------------------------------------------

export interface SkillRefsVersionFile {
  /** The plugin's own version. Optional so a corpus predating the split still parses. */
  plugin?: string;
  /** The ui-kit version the corpus was generated from. */
  uiKit?: string;
  date?: string;
  digestHash?: string;
}

/**
 * Recompute the digest `generate-skill-refs` stamps into VERSION.json.
 *
 * The input keys and the source paths must stay byte-identical to the ones in
 * `scripts/build-docs/generate-skill-refs.ts`; that file's `computeDigestHash`
 * docblock carries the same warning from the other side.
 */
export async function computeExpectedDigest(repoRoot: string): Promise<string> {
  // `registry.generated.ts` is not an input. It is gitignored, so on a clean
  // checkout it does not exist and the recomputed hash would never match the
  // committed one — the gate would fail on CI and pass on the machine that
  // happened to have generated it. The manifests it is derived from are tracked
  // and hashed below, so nothing is lost by leaving it out.
  const [tokens, common, styles, coreTypes] = await Promise.all([
    readOrEmpty(join(repoRoot, 'packages/ui-kit/src/tokens.ts')),
    readOrEmpty(join(repoRoot, 'packages/ui-kit/src/common.tsx')),
    readOrEmpty(join(repoRoot, 'packages/ui-kit/styles.css')),
    readOrEmpty(join(repoRoot, 'packages/core/src/types.ts')),
  ]);

  const records = await scanManifests(repoRoot, {
    continueOnError: true,
    logger: SILENT_LOGGER,
  });

  return computeDigestHash({
    tokens,
    common,
    styles,
    coreTypes,
    manifests: serializeManifests(records),
  });
}

// ---------------------------------------------------------------------------
// (b) Versions
// ---------------------------------------------------------------------------

interface PluginManifest {
  name?: string;
  version?: string;
}

interface MarketplaceEntry {
  name?: string;
  source?: string;
  version?: string;
}

interface MarketplaceFile {
  plugins?: MarketplaceEntry[];
}

/**
 * Locate the pxlkit entry in the marketplace. Matched by name first, then by
 * `source` pointing at the plugin directory, then — only when the marketplace
 * lists exactly one plugin — by being the only candidate.
 */
export function findMarketplaceEntry(
  marketplace: MarketplaceFile | null,
  pluginName: string | undefined,
): MarketplaceEntry | null {
  const plugins = marketplace?.plugins;
  if (!Array.isArray(plugins) || plugins.length === 0) return null;
  if (pluginName) {
    const byName = plugins.find((p) => p.name === pluginName);
    if (byName) return byName;
  }
  const bySource = plugins.find((p) => typeof p.source === 'string' && p.source.endsWith('plugins/pxlkit'));
  if (bySource) return bySource;
  return plugins.length === 1 ? plugins[0]! : null;
}

// ---------------------------------------------------------------------------
// (c) Pixelate map
// ---------------------------------------------------------------------------

const PXL_SYMBOL_RE = /\b(?:Pixel|PxlKit)[A-Z][A-Za-z0-9]*/g;

/**
 * Every `Pixel*` / `PxlKit*` symbol the pxlkit packages legitimately expose.
 *
 * Three sources, each added because the narrower set produced false positives:
 *
 *  - The **registry** alone misses providers, contexts and helper types
 *    (`PxlKitLocaleProvider`, `PxlKitSurfaceProvider`) — real public exports that
 *    are not registry entries.
 *  - Adding **`index.tsx`** covers those, but still misses the rendering
 *    primitives that live in `@pxlkit/core`. `pixelate-map.md` has to name
 *    `PxlKitIcon`: it is how every icon in the ecosystem is drawn, and telling a
 *    skill to convert lucide icons without naming it would be useless advice.
 *  - So **core's entry point** joins the union.
 *
 * The gate's job is catching references to components that do not exist, not
 * policing which package a real one lives in.
 */
/** Component names taken from the source filenames under `dir`, recursively. */
async function componentFileNames(dir: string): Promise<string[]> {
  const names: string[] = [];

  async function walk(current: string, depth: number): Promise<void> {
    if (depth > 4) return;
    let entries: Awaited<ReturnType<typeof readdir>>;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        // `__tests__` and `_internal` hold no public component.
        if (entry.name.startsWith('_') || entry.name === 'node_modules') continue;
        await walk(full, depth + 1);
        continue;
      }
      const match = /^((?:Pixel|PxlKit)[A-Z][A-Za-z0-9]*)\.tsx?$/.exec(entry.name);
      if (match) names.push(match[1]);
    }
  }

  await walk(dir, 0);
  return names;
}

export async function readKnownSymbols(repoRoot: string): Promise<Set<string>> {
  const known = new Set<string>();

  // The component source files are the oracle: one file per component, tracked in
  // git, and complete by construction.
  //
  // Two narrower sources were tried and both under-report. The generated registry is
  // gitignored, so on a clean checkout it is absent and every component vanishes from
  // the oracle. The manifests miss components that do not have one — `PixelIconButton`
  // is real, registered and exported, and has no manifest. Either mistake turns a
  // correct `pixelate-map.md` row into a CI failure that cannot be reproduced locally.
  for (const dir of ['packages/ui-kit/src', 'packages/core/src']) {
    for (const name of await componentFileNames(join(repoRoot, dir))) {
      known.add(name);
    }
  }

  // Providers, contexts and helper types are public exports that are not files of
  // their own, so the entry points still matter.
  const sources = [
    await tryRead(join(repoRoot, 'packages/ui-kit/src/index.tsx')),
    (await tryRead(join(repoRoot, 'packages/core/src/index.ts'))) ??
      (await tryRead(join(repoRoot, 'packages/core/src/index.tsx'))),
  ];

  for (const source of sources) {
    if (!source) continue;
    for (const m of source.matchAll(PXL_SYMBOL_RE)) known.add(m[0]);
  }

  return known;
}

export function extractCitedSymbols(markdown: string): string[] {
  const seen = new Set<string>();
  for (const m of markdown.matchAll(PXL_SYMBOL_RE)) seen.add(m[0]);
  return [...seen].sort();
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export const skillRefsFreshGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const drift: DriftItem[] = [];

  const versionFile = await tryReadJson<SkillRefsVersionFile>(join(repoRoot, VERSION_JSON));

  // A repo without the reference corpus is a repo where this gate has nothing
  // to say — the plugin simply is not wired up yet.
  const corpusPresent =
    versionFile !== null ||
    (await tryRead(join(repoRoot, `${REFERENCES_DIR}/setup.generated.md`))) !== null;

  if (!corpusPresent) {
    return { gateId: GATE_ID, description: DESCRIPTION, drift };
  }

  // --- (a) digest freshness ------------------------------------------------
  if (!versionFile || typeof versionFile.digestHash !== 'string') {
    drift.push({
      artifact: VERSION_JSON,
      expected: 'a VERSION.json carrying the digestHash of the generated references',
      actual: `missing or unreadable — ${REGENERATE_HINT}`,
      severity: 'major',
    });
  } else {
    const expected = await computeExpectedDigest(repoRoot);
    if (expected !== versionFile.digestHash) {
      drift.push({
        artifact: VERSION_JSON,
        expected: `digestHash ${expected} (recomputed from tokens, common, styles, core types and manifests)`,
        actual: `digestHash ${versionFile.digestHash} — the committed references are stale: ${REGENERATE_HINT}`,
        severity: 'major',
      });
    }
  }

  // --- (b) version coherence ----------------------------------------------
  const plugin = await tryReadJson<PluginManifest>(join(repoRoot, PLUGIN_JSON));
  const marketplace = await tryReadJson<MarketplaceFile>(join(repoRoot, MARKETPLACE_JSON));
  const entry = findMarketplaceEntry(marketplace, plugin?.name ?? 'pxlkit');

  // Two independent chains, because the plugin and the kit release separately.
  //
  // The plugin chain is the version users install and update to. The kit chain
  // records which version of the kit the digest was generated from. Collapsing them
  // into one comparison — as this gate originally did — makes a plugin-only release
  // impossible to express, which silently disables the update notice for exactly the
  // changes that need it most: a fix to a SKILL.md or a validation script.
  const pluginChain: Array<{ label: string; version: string | undefined }> = [
    { label: PLUGIN_JSON, version: plugin?.version },
    { label: `${MARKETPLACE_JSON} (plugins[${entry?.name ?? 'pxlkit'}])`, version: entry?.version },
    { label: `${VERSION_JSON} (plugin)`, version: versionFile?.plugin },
  ];
  const presentPlugin = pluginChain.filter(
    (d) => typeof d.version === 'string' && d.version.length > 0,
  );

  if (presentPlugin.length >= 2 && new Set(presentPlugin.map((d) => d.version)).size > 1) {
    drift.push({
      artifact: PLUGIN_JSON,
      expected: `plugin.json, ${MARKETPLACE_JSON} and ${VERSION_JSON}#plugin all declare the same plugin version`,
      actual: presentPlugin.map((d) => `${d.label}=${d.version}`).join(', '),
      severity: 'major',
    });
  }

  // Kit chain: the digest must say which kit it came from, and be right about it.
  const kitVersion = (
    await tryReadJson<{ version?: string }>(join(repoRoot, 'packages/ui-kit/package.json'))
  )?.version;

  if (kitVersion && versionFile?.uiKit && kitVersion !== versionFile.uiKit) {
    drift.push({
      artifact: VERSION_JSON,
      expected: `uiKit ${kitVersion} (the version the references were generated from)`,
      actual: `uiKit ${versionFile.uiKit} — ${REGENERATE_HINT}`,
      severity: 'major',
    });
  }

  // --- (c) pixelate map ----------------------------------------------------
  // Authored by a later task; its absence is not a finding.
  const pixelateMap = await tryRead(join(repoRoot, PIXELATE_MAP));
  if (pixelateMap) {
    const known = await readKnownSymbols(repoRoot);
    if (known.size > 0) {
      const unknown = extractCitedSymbols(pixelateMap).filter((s) => !known.has(s));
      for (const symbol of unknown) {
        drift.push({
          artifact: PIXELATE_MAP,
          expected: `every Pixel*/PxlKit* symbol cited exists in the ui-kit (${known.size} known exports)`,
          actual: `${symbol} is not exported by @pxlkit/ui-kit — fix the mapping or drop the row`,
          severity: 'major',
        });
      }
    }
  }

  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

// Orchestrator-compatible wrapper; the named functional export above is the
// pure core the unit tests exercise directly.
export default adaptFunctionalGate({
  id: 36,
  name: 'skill-refs-fresh',
  description: DESCRIPTION,
  fn: skillRefsFreshGate,
});
