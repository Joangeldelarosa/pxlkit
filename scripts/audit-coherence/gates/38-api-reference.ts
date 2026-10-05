/**
 * Gate 38 — api-reference.
 *
 * Every component section on /docs carries an API reference in React, Vue
 * and Angular, read from the kits' sources by the docs build
 * (scripts/build-docs/extract-api.ts). This gate reads the sources again and
 * holds the result to what the docs promise:
 *
 *   - MAJOR  a component without a React reference, or without a port's
 *            once that port shares the React kit's version (INFO before:
 *            the docs show its tab disabled, and gate 37 tracks the port);
 *   - MAJOR  a reference that lists no prop, event or slot, unless
 *            `EMPTY_REFERENCES` below says why it takes none;
 *   - MAJOR  a section that is missing, or shows another API than the
 *            sources have (the docs were not regenerated);
 *   - MINOR  a reason in `EMPTY_REFERENCES` that no longer applies;
 *   - INFO   the props, events and slots without a description, per
 *            framework.
 *
 * Safety: read-only.
 */
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import * as fs from 'fs-extra';
import type { Logger } from '../../build-docs/_lib/logger.js';
import { apiCoherenceFindings, type EmptyReferenceReasons } from '../../build-docs/_lib/api-coherence.js';
import type { ApiFramework } from '../../build-docs/_lib/api-model.js';
import { KIT_PORTS } from '../../build-docs/_lib/ports.js';
import { documentedNames, extractApi } from '../../build-docs/extract-api.js';
import { DEFAULT_OUT_SUBPATH, FILE_EXT } from '../../build-docs/generate-docs-page.js';
import { scanManifests } from '../../build-docs/scan-manifests.js';
import { Gate, gateFail, gateOk, type AuditContext, type GateResult } from '../_lib/gate-base.js';

const NAME = 'api-reference';
const REACT_KIT = { package: '@pxlkit/ui-kit', dir: 'packages/ui-kit' };

/**
 * References that list no prop, event or slot, and why: what the docs show
 * in their place is the component's whole API.
 */
export const EMPTY_REFERENCES: EmptyReferenceReasons = {
  'react PixelBareButton': 'Its props are the native <button> attributes, which its note sums up.',
  'react PixelBareInput': 'Its props are the native <input> attributes, which its note sums up.',
  'react PixelBareTextarea': 'Its props are the native <textarea> attributes, which its note sums up.',
  'angular PixelParallaxGroup': 'A directive without inputs: the element it is on stands for the React prop `as`.',
};

/** scanManifests is chatty by default; the audit runner owns the console. */
const SILENT_LOGGER: Logger = {
  info() {},
  warn() {},
  error() {},
  success() {},
  table() {},
};

async function versionOf(repoRoot: string, dir: string): Promise<string | undefined> {
  const file = path.join(repoRoot, dir, 'package.json');
  if (!(await fs.pathExists(file))) return undefined;
  return ((await fs.readJson(file)) as { version?: string }).version;
}

export class ApiReferenceGate extends Gate {
  id = 38;
  name = NAME;
  description =
    "Every component's /docs section shows an API reference in React, Vue and Angular, read from the kits' sources and up to date, that lists its props, events and slots — or says why it takes none.";

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = performance.now();
    const records = (await scanManifests(ctx.repoRoot, { continueOnError: true, logger: SILENT_LOGGER })).filter(
      (record) => record.package === REACT_KIT.package,
    );
    const names = documentedNames(records);
    const index = await extractApi(ctx.repoRoot, names);
    const sections = new Map<string, { file: string; source?: string }>();
    for (const name of names) {
      const file = `${DEFAULT_OUT_SUBPATH}/${name}${FILE_EXT}`;
      const absolute = path.join(ctx.repoRoot, file);
      sections.set(name, { file, ...((await fs.pathExists(absolute)) ? { source: await fs.readFile(absolute, 'utf8') } : {}) });
    }
    const reactVersion = await versionOf(ctx.repoRoot, REACT_KIT.dir);
    const released = new Set<ApiFramework>();
    for (const port of KIT_PORTS) {
      if ((await versionOf(ctx.repoRoot, port.dir)) === reactVersion) released.add(port.framework);
    }
    const findings = apiCoherenceFindings({ index, sections, released, emptyReasons: EMPTY_REFERENCES });
    const duration = Math.round(performance.now() - started);
    return findings.length === 0 ? gateOk(NAME, duration) : gateFail(NAME, findings, duration);
  }
}

export default new ApiReferenceGate();
