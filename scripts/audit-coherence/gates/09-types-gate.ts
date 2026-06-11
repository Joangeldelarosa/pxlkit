/**
 * 09-types-gate — Per-example TypeScript typecheck gate.
 *
 * For each `*.examples.tsx` discovered under `packages/* /src/**`, this gate
 * runs `tsc --noEmit` against an isolated tsconfig that includes only that
 * single example file (plus the project's lib/JSX settings inherited from the
 * package's tsconfig). Any type error produced by tsc surfaces as a blocker
 * finding, because broken examples mean the published docs/snippets won't
 * compile in user-land.
 *
 * Programmatic API:
 *   const gate = new TypesGate();
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/09-types-gate.ts [--root <dir>] [--json]
 *
 * Exit codes:
 *   0 — all examples typecheck cleanly (or none exist)
 *   1 — at least one example produced a type error, or tsc itself failed to run
 *
 * Safety: read-only with respect to sources. Writes only ephemeral tsconfig
 * files under `node_modules/.cache/types-gate-*` (inside the repo so tsc
 * resolves implicit @types correctly); never modifies repo sources.
 */

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as pc from 'picocolors';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';
import {
  createLogger,
  loadAuditContext,
  type Logger,
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TscInvocation {
  /** Absolute path to the examples.tsx that was checked. */
  file: string;
  /** Exit status reported by tsc. */
  exitCode: number;
  /** Combined stdout+stderr text from tsc. */
  output: string;
}

export interface TscRunner {
  /**
   * Invoke `tsc --noEmit` against a freshly-written ephemeral tsconfig that
   * scopes typechecking to a single examples file. Implementations MUST NOT
   * throw on a non-zero exit — they MUST resolve with the exit code so the
   * gate can attribute errors to a specific file.
   */
  (input: {
    repoRoot: string;
    examplesFile: string;
    packageTsconfig: string;
    logger: Logger;
  }): Promise<TscInvocation>;
}

export interface TypesGateOptions {
  /**
   * Override the tsc runner — used by unit tests to avoid spawning a real
   * TypeScript compiler. When omitted, the default runner is used which
   * shells out to the locally-resolved `tsc` binary.
   */
  runner?: TscRunner;
  /**
   * Override the examples discovery glob result. When omitted, the gate
   * scans `packages/* /src/** /*.examples.tsx`.
   */
  discoverExamples?: (ctx: AuditContext) => Promise<string[]>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXAMPLES_GLOB = 'packages/*/src/**/*.examples.tsx';
const EXAMPLES_IGNORE = ['**/node_modules/**', '**/dist/**', '**/__tests__/**'];

const GATE_NAME = 'types-gate';

// Regex catches `path/to/file.tsx(12,5): error TS1234: message`
// and the simpler `path/to/file.tsx:12:5 - error TS1234: message` form.
const TSC_DIAG_RE_PAREN =
  /^(?<file>[^(\n]+)\((?<line>\d+),(?<col>\d+)\):\s*error\s*(?<code>TS\d+):\s*(?<msg>.+)$/;
const TSC_DIAG_RE_COLON =
  /^(?<file>[^:\n]+):(?<line>\d+):(?<col>\d+)\s*-\s*error\s*(?<code>TS\d+):\s*(?<msg>.+)$/;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function findPackageTsconfig(examplesFile: string, repoRoot: string): string {
  // Walk up from the file until we hit a directory containing tsconfig.json
  // and that directory is inside `packages/<name>`.
  let dir = path.dirname(examplesFile);
  const root = path.parse(dir).root;
  while (dir && dir !== root && dir.startsWith(repoRoot)) {
    const candidate = path.join(dir, 'tsconfig.json');
    if (fs.pathExistsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  // Fall back to the ui-kit tsconfig — better than nothing.
  return path.join(repoRoot, 'packages/ui-kit/tsconfig.json');
}

function deriveComponentName(examplesFile: string): string {
  const base = path.basename(examplesFile).replace(/\.examples\.tsx$/, '');
  return base;
}

function parseTscDiagnostics(
  output: string,
  examplesFile: string,
): Array<{ line: number; col: number; code: string; message: string; file: string }> {
  const lines = output.split(/\r?\n/);
  const diagnostics: Array<{
    line: number;
    col: number;
    code: string;
    message: string;
    file: string;
  }> = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const m = TSC_DIAG_RE_PAREN.exec(trimmed) ?? TSC_DIAG_RE_COLON.exec(trimmed);
    if (!m?.groups) continue;
    diagnostics.push({
      file: m.groups.file.trim(),
      line: Number.parseInt(m.groups.line, 10),
      col: Number.parseInt(m.groups.col, 10),
      code: m.groups.code,
      message: m.groups.msg.trim(),
    });
  }
  // If we found no structured diagnostics but tsc produced output that looks
  // like an error, synthesize a single catch-all so the user sees something.
  if (diagnostics.length === 0 && /error/i.test(output)) {
    diagnostics.push({
      file: toPosix(examplesFile),
      line: 0,
      col: 0,
      code: 'TS0000',
      message: output.trim().slice(0, 500),
    });
  }
  return diagnostics;
}

// ---------------------------------------------------------------------------
// Default tsc runner
// ---------------------------------------------------------------------------

async function writeEphemeralTsconfig(
  repoRoot: string,
  examplesFile: string,
  packageTsconfig: string,
): Promise<{ tsconfigPath: string; cleanup: () => Promise<void> }> {
  // The ephemeral tsconfig must live INSIDE the repo: tsc resolves implicit
  // @types (e.g. @types/node for `process.env.NODE_ENV` dev warnings) by
  // walking up from the tsconfig directory. From the OS temp dir that walk
  // finds nothing and every such global becomes a false TS2580 blocker.
  const cacheRoot = path.join(repoRoot, 'node_modules', '.cache');
  await fs.ensureDir(cacheRoot);
  const tmpDir = await fs.mkdtemp(path.join(cacheRoot, 'types-gate-'));
  const tsconfigPath = path.join(tmpDir, 'tsconfig.json');
  const relExtends = toPosix(path.relative(tmpDir, packageTsconfig));
  const relInclude = toPosix(examplesFile);
  const payload = {
    extends: relExtends,
    compilerOptions: {
      noEmit: true,
      // Only neutralize options that conflict with noEmit. Forcing
      // `declaration: false` here used to trip TS5069 in every run because
      // package tsconfigs inherit `declarationDir`; leaving the declaration
      // family inherited is consistent with noEmit.
      emitDeclarationOnly: false,
      composite: false,
      incremental: false,
    },
    include: [relInclude],
    exclude: ['node_modules', 'dist'],
  };
  await fs.writeJson(tsconfigPath, payload, { spaces: 2 });
  return {
    tsconfigPath,
    cleanup: async () => {
      try {
        await fs.remove(tmpDir);
      } catch {
        /* best-effort */
      }
    },
  };
}

function resolveTscInvocation(repoRoot: string): {
  command: string;
  args: string[];
} {
  // Invoke tsc's JS entry with the current Node binary. Spawning the .cmd
  // shim directly with shell:false fails with EINVAL on Windows under
  // Node's CVE-2024-27980 mitigation, which used to turn every run of this
  // gate into a synthetic "no parseable diagnostics" blocker per file.
  const jsCandidates = [
    path.join(repoRoot, 'node_modules/typescript/lib/tsc.js'),
    path.join(repoRoot, 'packages/ui-kit/node_modules/typescript/lib/tsc.js'),
  ];
  for (const c of jsCandidates) {
    if (fs.pathExistsSync(c)) return { command: process.execPath, args: [c] };
  }
  // Fall back to whatever `tsc` resolves to on PATH (POSIX shells resolve
  // the extensionless shim fine).
  return { command: 'tsc', args: [] };
}

export const defaultTscRunner: TscRunner = async ({
  repoRoot,
  examplesFile,
  packageTsconfig,
  logger,
}) => {
  const { tsconfigPath, cleanup } = await writeEphemeralTsconfig(
    repoRoot,
    examplesFile,
    packageTsconfig,
  );
  try {
    const tsc = resolveTscInvocation(repoRoot);
    logger.debug(`tsc --noEmit -p ${tsconfigPath}  (for ${examplesFile})`);
    const proc: SpawnSyncReturns<string> = spawnSync(
      tsc.command,
      [...tsc.args, '--noEmit', '-p', tsconfigPath, '--pretty', 'false'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        shell: false,
        windowsHide: true,
      },
    );
    const stdout = proc.stdout ?? '';
    const stderr = proc.stderr ?? '';
    const exitCode = proc.status ?? (proc.error ? 1 : 0);
    let output = `${stdout}\n${stderr}`.trim();
    if (proc.error) {
      output = `${output}\n${proc.error.message}`.trim();
    }
    return { file: examplesFile, exitCode, output };
  } finally {
    await cleanup();
  }
};

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverExamplesDefault(ctx: AuditContext): Promise<string[]> {
  const files = await fgGlob(EXAMPLES_GLOB, {
    cwd: ctx.repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: EXAMPLES_IGNORE,
  });
  return files.map((f) => toPosix(f)).sort();
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export class TypesGate extends Gate {
  readonly id = 9;
  readonly name = GATE_NAME;
  readonly description =
    'For each examples.tsx, run tsc --noEmit on it in isolation. Blocker on type errors.';

  private readonly runner: TscRunner;
  private readonly discover: (ctx: AuditContext) => Promise<string[]>;

  constructor(options: TypesGateOptions = {}) {
    super();
    this.runner = options.runner ?? defaultTscRunner;
    this.discover = options.discoverExamples ?? discoverExamplesDefault;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const examples = await this.discover(ctx);

    if (examples.length === 0) {
      ctx.logger.debug('no *.examples.tsx files found — gate passes vacuously');
      return gateOk(this.name, Date.now() - start);
    }

    const findings: GateFinding[] = [];

    for (const examplesFile of examples) {
      const packageTsconfig = findPackageTsconfig(examplesFile, ctx.repoRoot);
      const component = deriveComponentName(examplesFile);
      let invocation: TscInvocation;
      try {
        invocation = await this.runner({
          repoRoot: ctx.repoRoot,
          examplesFile,
          packageTsconfig,
          logger: ctx.logger,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'blocker',
          file: toPosix(examplesFile),
          component,
          message: `failed to invoke tsc: ${message}`,
          suggestion:
            'Ensure typescript is installed in the workspace (npm install) and that the package tsconfig.json is readable.',
        });
        continue;
      }

      if (invocation.exitCode === 0) {
        ctx.logger.debug(`${component} examples — OK`);
        continue;
      }

      const diagnostics = parseTscDiagnostics(invocation.output, examplesFile);

      if (diagnostics.length === 0) {
        findings.push({
          severity: 'blocker',
          file: toPosix(examplesFile),
          component,
          message: `tsc exited with code ${invocation.exitCode} but produced no parseable diagnostics${
            invocation.output ? ` — raw output: ${invocation.output.slice(0, 200)}` : ''
          }`,
          suggestion:
            'Run `tsc --noEmit` against this file manually to inspect raw output.',
        });
        continue;
      }

      for (const diag of diagnostics) {
        const where =
          diag.line > 0 ? `${toPosix(diag.file)}:${diag.line}:${diag.col}` : toPosix(diag.file);
        findings.push({
          severity: 'blocker',
          file: toPosix(examplesFile),
          component,
          message: `${diag.code} at ${where} — ${diag.message}`,
          suggestion:
            'Fix the example so its types match the component API. Examples ship to docs and snippets; broken types mislead consumers.',
        });
      }
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - start);
    }
    return gateFail(this.name, findings, Date.now() - start);
  }
}

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  quiet: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { root: process.cwd(), json: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root' || arg === '-r') {
      const next = argv[i + 1];
      if (!next) throw new Error('--root requires a value');
      opts.root = path.resolve(next);
      i++;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--quiet' || arg === '-q') {
      opts.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: tsx scripts/audit-coherence/gates/09-types-gate.ts [options]',
          '',
          'Options:',
          '  --root, -r <dir>   Repo root to audit (default: cwd)',
          '  --json             Emit JSON GateResult on stdout',
          '  --quiet, -q        Suppress non-JSON log output',
          '  --help, -h         Show this help',
          '',
        ].join('\n'),
      );
      process.exit(0);
    }
  }
  return opts;
}

async function cliMain(argv: string[]): Promise<number> {
  const opts = parseCliArgs(argv);
  const logger = createLogger(!opts.quiet);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new TypesGate();
  const result = await gate.run(ctx);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (!opts.quiet) {
    const badge = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(`${badge} ${result.name} (${result.duration_ms}ms)\n`);
    for (const f of result.findings) {
      process.stdout.write(
        `  ${pc.yellow(f.severity)} ${f.component ?? '?'} ${f.file ?? ''}\n    ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`    ${pc.dim('-> ' + f.suggestion)}\n`);
      }
    }
  }
  return result.passed ? 0 : 1;
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  cliMain(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      process.stderr.write(`types-gate failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
      process.exit(1);
    });
}

export default TypesGate;
