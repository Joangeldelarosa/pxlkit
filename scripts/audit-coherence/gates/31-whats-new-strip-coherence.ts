import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';
import { resolveAdvertisedRelease } from '../_lib/release-policy.js';

const GATE_ID = '31-whats-new-strip-coherence';
const DESCRIPTION =
  'apps/web/src/components/whats-new-strip.tsx must exist, reference at least one current ui-kit registry component, and pin to a coherent ui-kit version: the current version, the advertised release (most recent with "### Added" entries, for version-only patches), or a dynamic `version` prop fed from the version SoT.';

const STRIP_PATH = 'apps/web/src/components/whats-new-strip.tsx';

interface ReadOptions {
  strip?: string | null;
  registry?: string | null;
  uiKitPackage?: { version?: string } | null;
  uiKitChangelog?: string | null;
}

export async function loadInputs(repoRoot: string): Promise<{
  strip: string | null;
  registry: string | null;
  uiKitPackage: { version?: string } | null;
  uiKitChangelog: string | null;
}> {
  const strip = await tryRead(join(repoRoot, STRIP_PATH));
  const registry = await tryRead(join(repoRoot, 'packages/ui-kit/src/registry.ts'));
  const pkgRaw = await tryRead(join(repoRoot, 'packages/ui-kit/package.json'));
  const uiKitPackage = pkgRaw ? (JSON.parse(pkgRaw) as { version?: string }) : null;
  const uiKitChangelog = await tryRead(join(repoRoot, 'packages/ui-kit/CHANGELOG.md'));
  return { strip, registry, uiKitPackage, uiKitChangelog };
}

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

export function parseRegistryComponents(registry: string): string[] {
  const matches = registry.match(/'([A-Za-z0-9_]+)'/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * True when the strip receives its version dynamically (a `version` prop /
 * template interpolation) instead of hardcoding a literal. A prop-driven
 * strip is fed from the version SoT (apps/web/src/lib/pxlkit-version.ts →
 * packages/ui-kit/package.json#version) at the call sites, so it can never
 * go stale by construction.
 */
export function isVersionPropDriven(strip: string): boolean {
  return (
    /\bversion\b\s*[:?]/.test(strip) ||
    /\$\{\s*version\s*\}/.test(strip) ||
    /\bprops\.version\b/.test(strip)
  );
}

export function evaluate(opts: ReadOptions): DriftItem[] {
  const drift: DriftItem[] = [];
  const { strip, registry, uiKitPackage, uiKitChangelog } = opts;

  if (!strip) {
    drift.push({
      artifact: STRIP_PATH,
      expected: 'File exists and surfaces recent ui-kit changes for the showcase site',
      actual: 'File does not exist',
      severity: 'blocker',
    });
    return drift;
  }

  if (!registry) {
    drift.push({
      artifact: 'packages/ui-kit/src/registry.ts',
      expected: 'Registry file is present so the gate can resolve current components',
      actual: 'Registry file missing — cannot validate strip references',
      severity: 'blocker',
    });
    return drift;
  }

  const components = parseRegistryComponents(registry);
  const referenced = components.filter((name) => strip.includes(name));

  if (referenced.length === 0) {
    drift.push({
      artifact: STRIP_PATH,
      expected: 'Strip references at least one current ui-kit component name from registry.ts',
      actual: 'No current registry component name appears in the strip source',
      severity: 'blocker',
    });
  }

  const version = uiKitPackage?.version;
  if (!version) {
    drift.push({
      artifact: 'packages/ui-kit/package.json',
      expected: 'package.json has a `version` field so the strip can pin to it',
      actual: 'version field missing — cannot validate strip version reference',
      severity: 'major',
    });
    return drift;
  }

  // Accepted versions: the current package version, plus — when the current
  // version is a version-only patch with no "### Added" entries — the
  // advertised release (most recent version that HAS Added entries). The
  // strip legitimately keeps advertising that release's content.
  const accepted = new Set([version]);
  if (uiKitChangelog) {
    const advertised = resolveAdvertisedRelease(uiKitChangelog, version);
    if (advertised?.isFallback) accepted.add(advertised.version);
  }

  // No word boundaries: version literals usually appear as "v1.5.0".
  const literals = strip.match(/\d+\.\d+\.\d+/g) ?? [];
  if (literals.length > 0) {
    if (!literals.some((l) => accepted.has(l))) {
      drift.push({
        artifact: STRIP_PATH,
        expected: `Strip mentions current ui-kit version (${version})${
          accepted.size > 1
            ? ` or the advertised release (${Array.from(accepted).filter((v) => v !== version).join(', ')})`
            : ''
        }`,
        actual: `Hardcoded version(s) ${literals.join(', ')} match neither — likely stale highlights`,
        severity: 'major',
      });
    }
  } else if (!isVersionPropDriven(strip)) {
    drift.push({
      artifact: STRIP_PATH,
      expected: `Strip mentions current ui-kit version (${version}) or receives a dynamic \`version\` prop from the version SoT`,
      actual: 'No version literal and no `version` prop found in strip source',
      severity: 'major',
    });
  }

  return drift;
}

export const whatsNewStripCoherenceGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const inputs = await loadInputs(repoRoot);
  const drift = evaluate(inputs);
  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

// Orchestrator-compatible wrapper; the named functional export above is
// the pure core the unit tests exercise directly.
export default adaptFunctionalGate({
  id: 31,
  name: 'whats-new-strip-coherence',
  description: DESCRIPTION,
  fn: whatsNewStripCoherenceGate,
});
