/**
 * 15-npm-publish-dryrun — Per-workspace npm-publish file-list gate.
 *
 * For every package discovered in the audit context, this gate shells out to
 * `npm publish --dry-run --workspace=<pkg> 2>&1` from the repo root, captures
 * the resulting tarball file listing, and asserts that `README.md` is part of
 * what npm would actually publish. README missing from the published tarball
 * is the single most common silent regression we see when someone tightens
 * the `files` array in package.json or forgets to copy a README into a new
 * package — and it produces a brand-damaging "no description" tile on the
 * npm registry. We catch it as a `major` finding here so the audit fails
 * loudly before anything reaches the registry.
 *
 * Programmatic API:
 *   const gate = new NpmPublishDryRunGate({ runner });
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/15-npm-publish-dryrun.ts [--root <dir>] [--json]
 *
 * Exit codes:
 *   0 — every workspace package would publish a README.md (or had no name)
 *   1 — at least one package would publish without a README.md
 *
 * Safety: read-only. `npm publish --dry-run` does not actually publish, does
 * not touch the registry, does not mutate the working tree. The runner is
 * injected so unit tests never spawn npm.
 */

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

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

export interface NpmDryRunInvocation {
  /** The workspace package name (the one passed via --workspace=<pkg>). */
  packageName: string;
  /** Exit status reported by npm. */
  exitCode: number;
  /** Combined stdout+stderr text from npm publish --dry-run. */
  output: string;
}

export interface NpmDryRunRunner {
  /**
   * Run `npm publish --dry-run --workspace=<pkg> 2>&1` from `repoRoot` and
   * resolve with the captured output. Implementations MUST NOT throw on a
   * non-zero exit — they MUST resolve so the gate can attribute findings
   * to a specific package.
   */
  (input: {
    repoRoot: string;
    packageName: string;
    logger: Logger;
  }): Promise<NpmDryRunInvocation>;
}

export interface NpmPublishDryRunGateOptions {
  /**
   * Override the npm runner — used by unit tests to avoid spawning npm.
   * When omitted, the default runner shells out to `npm` on PATH.
   */
  runner?: NpmDryRunRunner;
}

const GATE_NAME = 'npm-publish-dryrun';

// ---------------------------------------------------------------------------
// Output parsing
// ---------------------------------------------------------------------------

/**
 * Parse the file paths that npm publish --dry-run reports as part of the
 * tarball contents. The exact format varies slightly across npm versions
 * but in practice every shipped path appears on a line that ends with a
 * filename and is preceded by a size column. Examples:
 *
 *   npm notice 1.2kB README.md
 *   npm notice 312B  package.json
 *   npm notice  82B  dist/index.js
 *
 * Older npm versions omit the "npm notice" prefix inside the
 * "=== Tarball Contents ===" block. Both are tolerated.
 *
 * We deliberately extract every plausible path token after the size column,
 * lowercase the basename for comparison, and return the set so the caller
 * can ask "does this set contain README.md?" without worrying about which
 * directory it came from (root-only is the common case; a `docs/README.md`
 * does NOT satisfy the npm registry's README rendering, so we only count
 * root-level README.* files).
 */
export interface ParsedFileList {
  /** All extracted file paths (forward-slashed, repo-relative-ish). */
  files: string[];
  /** True if a root-level README.md (case-insensitive) is in the list. */
  hasRootReadme: boolean;
  /** Basenames of root-level README.* entries (lowercased, e.g. "readme.md"). */
  rootReadmeBasenames: string[];
}

const SIZE_FILE_RE =
  /^(?:npm notice\s+)?(?:[\d.]+\s*[kmgKMG]?B)\s+(?<file>[^\s].*?)\s*$/;

export function parseNpmDryRunFileList(output: string): ParsedFileList {
  const files: string[] = [];
  for (const raw of output.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = SIZE_FILE_RE.exec(line);
    if (!m?.groups) continue;
    const candidate = m.groups.file.trim();
    // Drop trailing punctuation npm sometimes appends (e.g. ANSI artifacts).
    const cleaned = candidate.replace(/[`'"]/g, '').trim();
    if (!cleaned) continue;
    // Normalise separators so Windows runners and POSIX runners look alike.
    const posix = cleaned.split(/\\/).join('/');
    files.push(posix);
  }

  const rootReadmeBasenames: string[] = [];
  for (const f of files) {
    if (f.includes('/')) continue; // root-level only
    const base = f.toLowerCase();
    if (/^readme(\.[a-z0-9]+)?$/.test(base)) {
      rootReadmeBasenames.push(base);
    }
  }

  return {
    files,
    hasRootReadme: rootReadmeBasenames.some((b) => b === 'readme.md'),
    rootReadmeBasenames,
  };
}

// ---------------------------------------------------------------------------
// Default npm runner
// ---------------------------------------------------------------------------

export const defaultNpmDryRunRunner: NpmDryRunRunner = async ({
  repoRoot,
  packageName,
  logger,
}) => {
  // On Windows the npm entrypoint is a .cmd shim, and Node's
  // CVE-2024-27980 mitigation rejects spawning .cmd files with shell:false
  // (EINVAL) — which used to fail this gate for every package. The args are
  // fixed strings plus the package name from package.json, so enabling the
  // shell on Windows is safe here.
  const isWindows = process.platform === 'win32';
  const npm = isWindows ? 'npm.cmd' : 'npm';
  logger.debug(`npm publish --dry-run --workspace=${packageName}`);
  const proc: SpawnSyncReturns<string> = spawnSync(
    npm,
    ['publish', '--dry-run', `--workspace=${packageName}`],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: isWindows,
      windowsHide: true,
      // npm writes the tarball contents to stderr in older versions and
      // stdout in newer ones; we merge both manually below so callers see
      // the combined `2>&1` view the brief promised.
    },
  );
  const stdout = proc.stdout ?? '';
  const stderr = proc.stderr ?? '';
  const exitCode = proc.status ?? (proc.error ? 1 : 0);
  let output = `${stdout}\n${stderr}`.trim();
  if (proc.error) {
    output = `${output}\n${proc.error.message}`.trim();
  }
  return { packageName, exitCode, output };
};

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class NpmPublishDryRunGate extends Gate {
  readonly id = 15;
  readonly name = GATE_NAME;
  readonly description =
    'For each workspace package, run npm publish --dry-run --workspace=<pkg> 2>&1, check the resulting file list includes the README.md. Major if README missing.';

  private readonly runner: NpmDryRunRunner;

  constructor(options: NpmPublishDryRunGateOptions = {}) {
    super();
    this.runner = options.runner ?? defaultNpmDryRunRunner;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const findings: GateFinding[] = [];

    if (ctx.packageJsons.length === 0) {
      ctx.logger.debug(
        'npm-publish-dryrun: no workspace packages found — gate passes vacuously',
      );
      return gateOk(this.name, Date.now() - start);
    }

    for (const ref of ctx.packageJsons) {
      const pkgJsonRel = path.relative(ctx.repoRoot, ref.path);
      const packageName = ref.package;

      let invocation: NpmDryRunInvocation;
      try {
        invocation = await this.runner({
          repoRoot: ctx.repoRoot,
          packageName,
          logger: ctx.logger,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'major',
          file: pkgJsonRel,
          component: packageName,
          message: `failed to invoke npm publish --dry-run for ${packageName}: ${message}`,
          suggestion:
            'Ensure npm is on PATH and the workspace name is correctly declared in package.json.',
        });
        continue;
      }

      const parsed = parseNpmDryRunFileList(invocation.output);

      if (invocation.exitCode !== 0 && parsed.files.length === 0) {
        // Couldn't even run — report the npm failure so the user sees why.
        findings.push({
          severity: 'major',
          file: pkgJsonRel,
          component: packageName,
          message: `npm publish --dry-run exited ${invocation.exitCode} for ${packageName} with no parseable file list.`,
          suggestion:
            'Run the command manually to inspect the failure: ' +
            `\`npm publish --dry-run --workspace=${packageName}\`.`,
        });
        continue;
      }

      if (!parsed.hasRootReadme) {
        const otherReadmes = parsed.rootReadmeBasenames.filter(
          (b) => b !== 'readme.md',
        );
        const noteTail =
          otherReadmes.length > 0
            ? ` (found ${otherReadmes.join(', ')}, but npm registry only renders README.md)`
            : parsed.files.length === 0
              ? ' (npm reported no tarball contents at all)'
              : '';
        findings.push({
          severity: 'major',
          file: pkgJsonRel,
          component: packageName,
          message: `Package ${packageName} would publish without a README.md${noteTail}.`,
          suggestion:
            'Add a README.md at the package root and ensure the package.json "files" array (or .npmignore) includes it. ' +
            `Re-run \`npm publish --dry-run --workspace=${packageName}\` to confirm the tarball includes README.md.`,
        });
        continue;
      }

      ctx.logger.debug(
        `npm-publish-dryrun: ${packageName} would publish README.md (${parsed.files.length} files total)`,
      );
    }

    const duration_ms = Date.now() - start;
    if (findings.length === 0) return gateOk(this.name, duration_ms);
    return gateFail(this.name, findings, duration_ms);
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
          'Usage: tsx scripts/audit-coherence/gates/15-npm-publish-dryrun.ts [options]',
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
  const gate = new NpmPublishDryRunGate();
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
      process.stderr.write(
        `npm-publish-dryrun failed: ${
          err instanceof Error ? err.stack ?? err.message : String(err)
        }\n`,
      );
      process.exit(1);
    });
}

export default NpmPublishDryRunGate;
