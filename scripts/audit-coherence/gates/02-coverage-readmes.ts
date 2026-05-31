/**
 * Gate 02 — coverage-readmes
 *
 * For each workspace package (`packages/*`) verify that a README.md exists AND
 * that its auto-managed components-list section matches the package's registry.
 *
 * The auto-managed section is delimited by the comment markers:
 *
 *   <!-- COMPONENTS:START -->
 *   ... list of components rendered by the docs pipeline ...
 *   <!-- COMPONENTS:END -->
 *
 * A package's registry is read from `packages/<pkg>/src/registry.ts` — any
 * exported `*_COMPONENTS` const array of string literals is treated as the
 * canonical list. Packages without a registry file are only checked for README
 * existence (no list to match against).
 *
 * Findings produced:
 *   - missing-readme           (major) — package has no README.md
 *   - missing-markers          (major) — README lacks COMPONENTS:START / END
 *   - empty-components-block   (major) — block exists but is blank
 *   - missing-component        (major) — registry component absent from README
 *   - extra-component          (major) — README lists a name not in registry
 *   - registry-unreadable      (major) — registry.ts could not be parsed
 *   - missing-end-marker       (major) — START found but END missing
 *
 * Programmatic API:
 *   const gate = new CoverageReadmesGate();
 *   const result = await gate.run(ctx);
 *
 * CLI:
 *   tsx scripts/audit-coherence/gates/02-coverage-readmes.ts [--root <dir>] [--json]
 *
 * Exit codes: 0 = passed, 1 = failed (major/blocker findings present).
 *
 * Safety: read-only. The gate never writes or mutates source files.
 */

import * as fs from 'fs-extra';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';

import {
  Gate,
  gateFail,
  gateOk,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';
import {
  createLogger,
  loadAuditContext,
  type AuditContext,
  type PackageFileRef,
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_ID = 2;
const GATE_NAME = 'coverage-readmes';
const START_MARKER = '<!-- COMPONENTS:START -->';
const END_MARKER = '<!-- COMPONENTS:END -->';

// Match any exported const array literal whose identifier ends with _COMPONENTS.
// Captures the array body so we can pull out the string literals.
const REGISTRY_EXPORT_RE =
  /export\s+const\s+[A-Z][A-Z0-9_]*_COMPONENTS\s*(?::[^=]+)?=\s*\[([\s\S]*?)\]\s*(?:as\s+const\s*)?;/g;

// Inside a registry array, names appear as 'PixelButton' or "PixelButton".
const NAME_LITERAL_RE = /['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/g;

// Find component-like tokens inside a README block. We accept backticked names
// (`PixelButton`), table-cell names (| `PixelButton` |), and bare PascalCase
// identifiers. Anything that looks like an identifier of length ≥ 2 counts.
const README_NAME_TOKEN_RE = /`([A-Za-z_$][A-Za-z0-9_$]+)`|\b([A-Z][A-Za-z0-9_$]+)\b/g;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RegistryParseResult {
  names: string[];
  found: boolean;
  errors: string[];
}

/** Parse a registry.ts file textually — strict-mode-safe, no eval. */
export function parseRegistrySource(source: string): RegistryParseResult {
  const names = new Set<string>();
  let found = false;
  const errors: string[] = [];

  let match: RegExpExecArray | null;
  REGISTRY_EXPORT_RE.lastIndex = 0;
  while ((match = REGISTRY_EXPORT_RE.exec(source)) !== null) {
    found = true;
    const body = match[1] ?? '';
    NAME_LITERAL_RE.lastIndex = 0;
    let nameMatch: RegExpExecArray | null;
    while ((nameMatch = NAME_LITERAL_RE.exec(body)) !== null) {
      const value = nameMatch[1];
      if (value) names.add(value);
    }
  }

  if (!found) {
    errors.push('no exported *_COMPONENTS const array found');
  }

  return { names: Array.from(names).sort(), found, errors };
}

/** Extract the body between the START and END markers (inclusive bounds). */
export interface ReadmeBlock {
  hasStart: boolean;
  hasEnd: boolean;
  body: string;
}

export function extractComponentsBlock(readme: string): ReadmeBlock {
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);
  const hasStart = startIdx !== -1;
  const hasEnd = endIdx !== -1;
  if (!hasStart || !hasEnd || endIdx < startIdx) {
    return { hasStart, hasEnd, body: '' };
  }
  const bodyStart = startIdx + START_MARKER.length;
  return {
    hasStart,
    hasEnd,
    body: readme.slice(bodyStart, endIdx),
  };
}

/** Extract component-like names from the README block body. */
export function extractReadmeNames(block: string): string[] {
  const out = new Set<string>();
  README_NAME_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = README_NAME_TOKEN_RE.exec(block)) !== null) {
    const value = match[1] ?? match[2];
    if (!value) continue;
    // Filter obvious markdown noise — single capital letters and reserved words.
    if (value.length < 2) continue;
    out.add(value);
  }
  return Array.from(out).sort();
}

/** Locate registry.ts for a given package directory, if any. */
async function findRegistryFile(packageDir: string): Promise<string | null> {
  const candidates = [
    path.join(packageDir, 'src', 'registry.ts'),
    path.join(packageDir, 'src', 'registry.tsx'),
  ];
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) return candidate;
  }
  return null;
}

interface PackageCheckInput {
  pkg: PackageFileRef;
  readme: PackageFileRef | undefined;
  registryFile: string | null;
}

interface PackageCheckOutput {
  findings: GateFinding[];
}

async function checkPackage(input: PackageCheckInput): Promise<PackageCheckOutput> {
  const findings: GateFinding[] = [];
  const { pkg, readme, registryFile } = input;

  // 1. README must exist.
  if (!readme) {
    findings.push({
      severity: 'major',
      file: path.join(path.dirname(pkg.path), 'README.md'),
      component: pkg.package,
      message: `package ${pkg.package} has no README.md`,
      suggestion:
        'create a README.md at the package root with a <!-- COMPONENTS:START --> ... <!-- COMPONENTS:END --> block',
    });
    return { findings };
  }

  const readmeText = await fs.readFile(readme.path, 'utf8');
  const block = extractComponentsBlock(readmeText);

  // 2. If no registry, only README existence is enforced — done.
  if (!registryFile) {
    return { findings };
  }

  // 3. Parse registry.
  let registry: RegistryParseResult;
  try {
    const source = await fs.readFile(registryFile, 'utf8');
    registry = parseRegistrySource(source);
  } catch (err) {
    findings.push({
      severity: 'major',
      file: registryFile,
      component: pkg.package,
      message: `failed to read registry: ${
        err instanceof Error ? err.message : String(err)
      }`,
      suggestion: 'verify registry.ts exists and is readable',
    });
    return { findings };
  }

  if (!registry.found) {
    findings.push({
      severity: 'major',
      file: registryFile,
      component: pkg.package,
      message: `registry has no exported *_COMPONENTS const array`,
      suggestion:
        'export a const array named like PACKAGE_COMPONENTS = [...] as const',
    });
    return { findings };
  }

  // 4. Markers must be present.
  if (!block.hasStart) {
    findings.push({
      severity: 'major',
      file: readme.path,
      component: pkg.package,
      message: `README missing ${START_MARKER}`,
      suggestion: `insert the auto-managed block: ${START_MARKER} ... ${END_MARKER}`,
    });
    return { findings };
  }
  if (!block.hasEnd) {
    findings.push({
      severity: 'major',
      file: readme.path,
      component: pkg.package,
      message: `README has ${START_MARKER} but missing ${END_MARKER}`,
      suggestion: `close the components block with ${END_MARKER}`,
    });
    return { findings };
  }

  // 5. Block must not be empty when registry has entries.
  const trimmed = block.body.trim();
  if (registry.names.length > 0 && trimmed.length === 0) {
    findings.push({
      severity: 'major',
      file: readme.path,
      component: pkg.package,
      message: 'components block is empty but registry lists components',
      suggestion: `regenerate the block to include: ${registry.names.join(', ')}`,
    });
    return { findings };
  }

  // 6. Diff registry vs README content.
  const readmeNames = new Set(extractReadmeNames(block.body));
  const registrySet = new Set(registry.names);

  for (const name of registry.names) {
    if (!readmeNames.has(name)) {
      findings.push({
        severity: 'major',
        file: readme.path,
        component: name,
        message: `registry component ${name} is missing from README components block`,
        suggestion: 'regenerate README components block to include this component',
      });
    }
  }

  for (const name of readmeNames) {
    if (registrySet.has(name)) continue;
    // Only flag PascalCase names that LOOK like component identifiers.
    if (!/^[A-Z][A-Za-z0-9_$]+$/.test(name)) continue;
    // Heuristic: must look like a Pxlkit component (Pixel* / PxlKit*).
    if (!/^(Pixel|PxlKit)/.test(name)) continue;
    findings.push({
      severity: 'major',
      file: readme.path,
      component: name,
      message: `README references ${name} but it is not in the registry`,
      suggestion: 'either add it to registry.ts or remove it from the README',
    });
  }

  return { findings };
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export class CoverageReadmesGate extends Gate {
  readonly id = GATE_ID;
  readonly name = GATE_NAME;
  readonly description =
    "For each workspace package (packages/*), verify README.md exists AND its components-list section matches the package's registry. Use comment markers <!-- COMPONENTS:START --> ... <!-- COMPONENTS:END --> to identify the auto-managed section. Major if missing markers or mismatch.";

  async run(ctx: AuditContext): Promise<GateResult> {
    const t0 = performance.now();
    const findings: GateFinding[] = [];

    if (ctx.packageJsons.length === 0) {
      findings.push({
        severity: 'major',
        message: 'no packages discovered under packages/*',
        suggestion: 'ensure the repo has packages/* workspaces with package.json',
      });
      return gateFail(this.name, findings, performance.now() - t0);
    }

    const readmeIndex = new Map<string, PackageFileRef>(
      ctx.readmeFiles.map((r) => [r.package, r]),
    );

    for (const pkg of ctx.packageJsons) {
      const packageDir = path.dirname(pkg.path);
      const readme = readmeIndex.get(pkg.package);
      const registryFile = await findRegistryFile(packageDir);
      const result = await checkPackage({ pkg, readme, registryFile });
      findings.push(...result.findings);
    }

    const duration_ms = performance.now() - t0;
    if (findings.length === 0) return gateOk(this.name, duration_ms);
    return gateFail(this.name, findings, duration_ms);
  }
}

export default CoverageReadmesGate;

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  quiet: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    root: process.cwd(),
    json: false,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root') {
      const next = argv[++i];
      if (next) opts.root = next;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--quiet') {
      opts.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: tsx 02-coverage-readmes.ts [--root <dir>] [--json] [--quiet]',
      );
      process.exit(0);
    }
  }
  return opts;
}

async function runCli(): Promise<number> {
  const opts = parseCliArgs(process.argv.slice(2));
  const logger = createLogger(!opts.quiet);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new CoverageReadmesGate();
  const result = await gate.run(ctx);

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else if (!opts.quiet) {
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(
      `[${status}] ${result.name} — ${result.findings.length} findings in ${result.duration_ms.toFixed(1)}ms`,
    );
    for (const f of result.findings) {
      const loc = f.file ? ` (${f.file})` : '';
      const comp = f.component ? ` [${f.component}]` : '';
      console.log(`  ${f.severity.toUpperCase()}${comp}${loc}: ${f.message}`);
      if (f.suggestion) console.log(`    → ${f.suggestion}`);
    }
  }
  return result.passed ? 0 : 1;
}

// ESM entry-point detection.
const isMain =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url.startsWith('file:') &&
  (() => {
    try {
      const argvUrl = new URL(`file://${process.argv[1].replace(/\\/g, '/')}`);
      return argvUrl.pathname.endsWith('/02-coverage-readmes.ts');
    } catch {
      return false;
    }
  })();

if (isMain) {
  runCli().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err instanceof Error ? err.stack ?? err.message : String(err));
      process.exit(1);
    },
  );
}
