/**
 * Gate 37 — port-examples.
 *
 * The Vue and Angular kits mirror the React kit example for example
 * (ADR-0006). A component is ported when every example of its manifest
 * exists in the port, named like the React export and filed under the
 * manifest's category:
 *
 *   Vue      packages/ui-kit-vue/examples/<category>/<Component>/<Export>.vue
 *   Angular  packages/ui-kit-angular/examples/<category>/<component-kebab>.examples.ts
 *
 * The parity suites replay exactly those examples against React, and the
 * docs list a component under a framework from them. Findings, per port:
 *
 *   - MAJOR  an example that no manifest example matches (renamed or dropped
 *            in React), or examples of a component React does not have:
 *            parity never checks them and the docs never show them;
 *   - MAJOR  a component the port covers only in part: the docs leave it out
 *            and parity skips the examples it lacks;
 *   - MAJOR  examples filed under another category than the manifest's;
 *   - INFO → MAJOR  components the port does not cover yet: listed while
 *            the port's version differs from the React kit's, a failure once
 *            they share one — kits released at one version ship the same
 *            components.
 */
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import * as fs from 'fs-extra';
import type { Logger } from '../../build-docs/_lib/logger.js';
import {
  KIT_PORTS,
  manifestExampleExports,
  portComponents,
  portKey,
  type KitPort,
  type PortedComponent,
} from '../../build-docs/_lib/ports.js';
import { scanManifests } from '../../build-docs/scan-manifests.js';
import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

const NAME = 'port-examples';
const REACT_KIT = { package: '@pxlkit/ui-kit', dir: 'packages/ui-kit' };

/** A React component, as far as its ports are concerned. */
export interface ReactComponentExamples {
  name: string;
  category: string;
  /** The export names of its manifest examples. */
  examples: readonly string[];
}

/** What one port implements, at which version. */
export interface PortState {
  port: KitPort;
  version: string;
  /** By component key (`portKey`). */
  components: ReadonlyMap<string, PortedComponent>;
}

const list = (names: readonly string[]) => names.join(', ');

/** The findings for one port, against the React kit's components at `reactVersion`. */
export function portFindings(
  react: readonly ReactComponentExamples[],
  reactVersion: string,
  { port, version, components }: PortState,
): GateFinding[] {
  const findings: GateFinding[] = [];
  const expected = new Set<string>();
  const unported: string[] = [];
  for (const component of react) {
    const key = portKey(port, component.name);
    expected.add(key);
    const ported = components.get(key);
    if (!ported) {
      unported.push(component.name);
      continue;
    }
    const lacking = component.examples.filter((name) => !ported.exports.has(name));
    if (lacking.length > 0) {
      findings.push({
        severity: 'major',
        component: component.name,
        file: ported.path,
        message: `${port.package} lacks ${lacking.length} of the ${component.examples.length} examples of ${component.name}: ${list(lacking)}.`,
        suggestion: 'Port every example of the manifest, named like its React export.',
      });
    }
    const strays = [...ported.exports].filter((name) => !component.examples.includes(name)).sort();
    if (strays.length > 0) {
      findings.push({
        severity: 'major',
        component: component.name,
        file: ported.path,
        message: `${port.package} has examples of ${component.name} that no manifest example matches: ${list(strays)}.`,
        suggestion: 'Name each example like the React export it mirrors, or remove the ones React dropped.',
      });
    }
    if (ported.category !== component.category) {
      findings.push({
        severity: 'major',
        component: component.name,
        file: ported.path,
        message: `${port.package} files ${component.name}'s examples under "${ported.category}"; its manifest's category is "${component.category}".`,
        suggestion: `Move them under examples/${component.category}/.`,
      });
    }
  }
  for (const [key, ported] of components) {
    if (expected.has(key)) continue;
    findings.push({
      severity: 'major',
      file: ported.path,
      message: `${port.package} has examples for "${key}", which is not a React kit component.`,
      suggestion: 'Name the folder or file after the React component it ports, or remove it.',
    });
  }
  if (unported.length > 0) {
    const released = version === reactVersion;
    findings.push({
      severity: released ? 'major' : 'info',
      message: `${port.package} ${version} does not implement ${unported.length} of the React kit's ${react.length} components yet: ${list(unported)}.`,
      suggestion: released
        ? `It shares the React kit's version (${reactVersion}): kits released at one version ship the same components.`
        : `Required once the port shares the React kit's version (now ${reactVersion}).`,
    });
  }
  return findings;
}

/** scanManifests is chatty by default; the audit runner owns the console. */
const SILENT_LOGGER: Logger = {
  info() {},
  warn() {},
  error() {},
  success() {},
  table() {},
};

async function versionOf(repoRoot: string, dir: string): Promise<string> {
  const pkg = (await fs.readJson(path.join(repoRoot, dir, 'package.json'))) as { version?: string };
  return pkg.version ?? '0.0.0';
}

export class PortExamplesGate extends Gate {
  id = 37;
  name = NAME;
  description =
    "The Vue and Angular kits implement every example of each React manifest they cover, named and filed like React's — and every component once they share the React kit's version.";

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = performance.now();
    const records = (await scanManifests(ctx.repoRoot, { continueOnError: true, logger: SILENT_LOGGER })).filter(
      (record) => record.package === REACT_KIT.package,
    );
    const react = await Promise.all(
      records.map(async (record) => ({
        name: record.manifest.name,
        // The manifest schema requires one; an empty string matches no folder.
        category: record.manifest.category ?? '',
        examples: await manifestExampleExports(record),
      })),
    );
    const reactVersion = await versionOf(ctx.repoRoot, REACT_KIT.dir);
    const findings: GateFinding[] = [];
    for (const port of KIT_PORTS) {
      if (!(await fs.pathExists(path.join(ctx.repoRoot, port.dir, 'package.json')))) continue;
      findings.push(
        ...portFindings(react, reactVersion, {
          port,
          version: await versionOf(ctx.repoRoot, port.dir),
          components: await portComponents(ctx.repoRoot, port),
        }),
      );
    }
    const duration = Math.round(performance.now() - started);
    return findings.length === 0 ? gateOk(NAME, duration) : gateFail(NAME, findings, duration);
  }
}

export default new PortExamplesGate();
