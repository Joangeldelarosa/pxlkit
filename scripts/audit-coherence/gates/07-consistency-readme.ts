import * as path from 'node:path';
import * as fs from 'fs-extra';
import { Gate, gateFail, gateOk, type GateFinding, type GateResult } from '../_lib/gate-base.js';
import type { AuditContext, PackageFileRef } from '../_lib/load-context.js';

/**
 * Programmatic shape so callers/tests can inspect intermediate results.
 */
export interface PackageRegistryReadmeReport {
  package: string;
  registryFile: string;
  readmeFile: string | null;
  registryComponents: string[];
  readmeComponents: string[];
  missingInReadme: string[];
  missingInRegistry: string[];
}

const COMPONENT_TOKEN_RE = /`([A-Z][A-Za-z0-9_]*)`/g;

/**
 * Match `export const SOMETHING = [ ... ] as const;` and pull literal entries.
 * We intentionally avoid `import()`-ing the registry to keep this gate
 * filesystem-only (no runtime side effects on the kit).
 */
const REGISTRY_BLOCK_RE = /export\s+const\s+([A-Z0-9_]+)\s*=\s*\[([\s\S]*?)\]\s*as\s+const/g;
const REGISTRY_ITEM_RE = /['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g;

/**
 * Section headers in the README we treat as "the Components section".
 * Match a top-level `## Components` heading (case-insensitive); we then read
 * until the next `## ` heading.
 */
const COMPONENTS_HEADING_RE = /^##\s+components\b/i;
const NEXT_TOP_LEVEL_HEADING_RE = /^##\s+/;

/**
 * Some README tables document hooks/utilities (e.g. `usePxlKitLocale()`,
 * `toLocaleUpper()`). Those are NOT in registry.ts. We only diff entries
 * that look like React component identifiers: PascalCase, no trailing `()`.
 */
function isComponentIdentifier(token: string, raw: string): boolean {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(token)) return false;
  // Reject things written as `useThing()` or `toThing()` in the original cell.
  // (COMPONENT_TOKEN_RE only matches identifier chars inside backticks, so
  // `useFoo()` wouldn't capture anyway — but defend in depth.)
  if (raw.endsWith('()')) return false;
  return true;
}

export function parseRegistryComponents(source: string): string[] {
  const seen = new Set<string>();
  for (const block of source.matchAll(REGISTRY_BLOCK_RE)) {
    const body = block[2] ?? '';
    for (const item of body.matchAll(REGISTRY_ITEM_RE)) {
      const name = item[1];
      if (name && /^[A-Z]/.test(name)) seen.add(name);
    }
  }
  return [...seen];
}

export function parseReadmeComponents(readme: string): string[] {
  const lines = readme.split(/\r?\n/);
  const found = new Set<string>();
  let inComponents = false;

  for (const line of lines) {
    if (COMPONENTS_HEADING_RE.test(line)) {
      inComponents = true;
      continue;
    }
    if (inComponents && NEXT_TOP_LEVEL_HEADING_RE.test(line)) {
      // Reached the next top-level section — stop scanning.
      break;
    }
    if (!inComponents) continue;

    for (const match of line.matchAll(COMPONENT_TOKEN_RE)) {
      const token = match[1];
      const rawCell = match[0];
      if (token && isComponentIdentifier(token, rawCell)) {
        found.add(token);
      }
    }
  }
  return [...found];
}

async function findRegistryForPackage(pkgJson: PackageFileRef): Promise<string | null> {
  const candidates = [
    path.join(path.dirname(pkgJson.path), 'src/registry.ts'),
    path.join(path.dirname(pkgJson.path), 'src/registry.tsx'),
  ];
  for (const c of candidates) {
    if (await fs.pathExists(c)) return c;
  }
  return null;
}

function findReadmeForPackage(
  pkgJson: PackageFileRef,
  readmeFiles: PackageFileRef[],
): PackageFileRef | null {
  return readmeFiles.find((r) => r.package === pkgJson.package) ?? null;
}

function diffArrays(a: string[], b: string[]): string[] {
  const bSet = new Set(b);
  return a.filter((x) => !bSet.has(x)).sort();
}

export async function auditReadmeRegistryConsistency(
  ctx: AuditContext,
): Promise<PackageRegistryReadmeReport[]> {
  const reports: PackageRegistryReadmeReport[] = [];

  for (const pkg of ctx.packageJsons) {
    const registryFile = await findRegistryForPackage(pkg);
    if (!registryFile) continue;

    const readmeRef = findReadmeForPackage(pkg, ctx.readmeFiles);
    const registrySource = await fs.readFile(registryFile, 'utf8');
    const registryComponents = parseRegistryComponents(registrySource);

    let readmeComponents: string[] = [];
    if (readmeRef) {
      const readmeSource = await fs.readFile(readmeRef.path, 'utf8');
      readmeComponents = parseReadmeComponents(readmeSource);
    }

    reports.push({
      package: pkg.package,
      registryFile,
      readmeFile: readmeRef?.path ?? null,
      registryComponents: [...registryComponents].sort(),
      readmeComponents: [...readmeComponents].sort(),
      missingInReadme: diffArrays(registryComponents, readmeComponents),
      missingInRegistry: diffArrays(readmeComponents, registryComponents),
    });
  }

  return reports;
}

export class ConsistencyReadmeGate extends Gate {
  id = 7;
  name = 'consistency-readme';
  description =
    'For each package: README.md components section matches registry.ts list exactly. Major on mismatch.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];
    const reports = await auditReadmeRegistryConsistency(ctx);

    for (const r of reports) {
      if (!r.readmeFile) {
        findings.push({
          severity: 'major',
          file: r.registryFile,
          component: r.package,
          message: `Package "${r.package}" has registry.ts but no README.md to validate components against.`,
          suggestion: `Add a README.md beside ${path.basename(r.registryFile)} with a "## Components" section.`,
        });
        continue;
      }

      for (const name of r.missingInReadme) {
        findings.push({
          severity: 'major',
          file: r.readmeFile,
          component: name,
          message: `Component "${name}" is exported from registry.ts but absent from README.md "## Components" section in ${r.package}.`,
          suggestion: `Add a row for \`${name}\` to the appropriate sub-section of README.md.`,
        });
      }

      for (const name of r.missingInRegistry) {
        findings.push({
          severity: 'major',
          file: r.readmeFile,
          component: name,
          message: `README.md lists "${name}" under Components but it is not in registry.ts for ${r.package}.`,
          suggestion: `Either add \`${name}\` to registry.ts or remove the README row.`,
        });
      }
    }

    const duration_ms = Date.now() - started;
    if (findings.length === 0) return gateOk(this.name, duration_ms);
    return gateFail(this.name, findings, duration_ms);
  }
}

export default ConsistencyReadmeGate;
