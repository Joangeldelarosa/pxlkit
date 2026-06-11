import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';

const GATE_ID = '31-whats-new-strip-coherence';
const DESCRIPTION =
  'apps/web/src/components/whats-new-strip.tsx must exist, reference at least one current ui-kit registry component, and mention the current ui-kit version.';

const STRIP_PATH = 'apps/web/src/components/whats-new-strip.tsx';

interface ReadOptions {
  strip?: string | null;
  registry?: string | null;
  uiKitPackage?: { version?: string } | null;
}

export async function loadInputs(repoRoot: string): Promise<{
  strip: string | null;
  registry: string | null;
  uiKitPackage: { version?: string } | null;
}> {
  const strip = await tryRead(join(repoRoot, STRIP_PATH));
  const registry = await tryRead(join(repoRoot, 'packages/ui-kit/src/registry.ts'));
  const pkgRaw = await tryRead(join(repoRoot, 'packages/ui-kit/package.json'));
  const uiKitPackage = pkgRaw ? (JSON.parse(pkgRaw) as { version?: string }) : null;
  return { strip, registry, uiKitPackage };
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

export function evaluate(opts: ReadOptions): DriftItem[] {
  const drift: DriftItem[] = [];
  const { strip, registry, uiKitPackage } = opts;

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
  } else if (!strip.includes(version)) {
    drift.push({
      artifact: STRIP_PATH,
      expected: `Strip mentions current ui-kit version (${version})`,
      actual: `Version ${version} not found in strip source — likely stale highlights`,
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
