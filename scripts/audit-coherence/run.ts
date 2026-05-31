/**
 * Coherence Audit Runner
 *
 * Loads the AuditContext, instantiates all 30 gates in `./gates/*.ts`, runs them
 * in parallel, aggregates findings, and writes `coherence-report.md` at the repo
 * root. Supports `--json` for CI consumption.
 *
 * Programmatic API:
 *   const result = await runAudit({ repoRoot: '/path/to/repo' });
 *
 * CLI:
 *   tsx scripts/audit-coherence/run.ts [--json] [--verbose]
 *
 * Exit codes:
 *   0 — all gates passed
 *   1 — one or more gates failed (blocker or major findings)
 *
 * Safety: read-only against the repo. Writes only to `coherence-report.md`
 * (gitignored) at repo root, unless `--json` is passed, in which case the
 * report is emitted to stdout and no file is written.
 */

import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as pc from 'picocolors';

import { Gate, type GateResult, type GateFinding, type GateSeverity } from './_lib/gate-base.js';
import { createLogger, loadAuditContext, type AuditContext, type Logger } from './_lib/load-context.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditSummary {
  total: number;
  passed: number;
  failed: number;
  by_severity: Record<GateSeverity, number>;
  duration_ms: number;
}

export interface AuditReport {
  ok: boolean;
  generated_at: string;
  repo_root: string;
  summary: AuditSummary;
  gates: GateResult[];
}

export interface RunAuditOptions {
  repoRoot: string;
  logger?: Logger;
  /** When false, do not write coherence-report.md to disk. Default: true. */
  writeReport?: boolean;
  /** Output file path. Default: `<repoRoot>/coherence-report.md`. */
  reportPath?: string;
}

// ---------------------------------------------------------------------------
// Gate discovery & loading
// ---------------------------------------------------------------------------

interface LoadedGate {
  id: number;
  file: string;
  gate: Gate;
}

interface GateModule {
  default?: unknown;
}

function isGateInstance(value: unknown): value is Gate {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.run === 'function' &&
    typeof obj.name === 'string' &&
    typeof obj.id === 'number'
  );
}

/**
 * Resolve a default export to a Gate instance. Handles three shapes:
 *   1. Gate instance (`export default gate`)
 *   2. Gate subclass constructor (`export default class FooGate extends Gate`)
 *   3. Factory function returning a Gate (`export default function create…()`)
 */
function resolveGate(value: unknown): Gate | null {
  if (isGateInstance(value)) return value;
  if (typeof value === 'function') {
    try {
      // Try as factory first — call with no args.
      const result = (value as (...args: unknown[]) => unknown)();
      if (isGateInstance(result)) return result;
    } catch {
      // Not a factory — fall through to constructor attempt.
    }
    try {
      // Try as constructor.
      const Ctor = value as new () => unknown;
      const instance = new Ctor();
      if (isGateInstance(instance)) return instance;
    } catch {
      // Not a constructor either.
    }
  }
  return null;
}

async function discoverGates(thisFileDir: string, logger: Logger): Promise<LoadedGate[]> {
  const gateFiles = await fgGlob('gates/*.ts', {
    cwd: thisFileDir,
    absolute: true,
    onlyFiles: true,
    ignore: ['**/*.d.ts', '**/__tests__/**'],
  });

  const loaded: LoadedGate[] = [];
  for (const file of gateFiles.sort()) {
    const base = path.basename(file);
    const idMatch = /^(\d+)-/.exec(base);
    const id = idMatch ? Number.parseInt(idMatch[1], 10) : Number.POSITIVE_INFINITY;
    try {
      const mod = (await import(pathToFileURL(file).href)) as GateModule;
      const gate = resolveGate(mod.default);
      if (!gate) {
        logger.warn(`gate file ${base} has no usable default export — skipping.`);
        continue;
      }
      loaded.push({ id, file, gate });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`failed to load gate ${base}: ${message}`);
    }
  }
  return loaded.sort((a, b) => a.id - b.id);
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

async function runGateSafely(gate: Gate, ctx: AuditContext): Promise<GateResult> {
  const startedAt = Date.now();
  try {
    return await gate.run(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : '';
    return {
      name: gate.name,
      passed: false,
      duration_ms: Date.now() - startedAt,
      findings: [
        {
          severity: 'blocker',
          message: `gate threw: ${message}`,
          suggestion: stack ? stack.split('\n').slice(0, 4).join('\n') : undefined,
        },
      ],
    };
  }
}

function emptySeverityCounter(): Record<GateSeverity, number> {
  return { blocker: 0, major: 0, minor: 0, info: 0 };
}

function summarize(results: GateResult[], totalDuration: number): AuditSummary {
  const by_severity = emptySeverityCounter();
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (r.passed) passed += 1;
    else failed += 1;
    for (const f of r.findings) by_severity[f.severity] += 1;
  }
  return {
    total: results.length,
    passed,
    failed,
    by_severity,
    duration_ms: totalDuration,
  };
}

// ---------------------------------------------------------------------------
// Report rendering
// ---------------------------------------------------------------------------

function severityBadge(s: GateSeverity): string {
  switch (s) {
    case 'blocker':
      return '[BLOCKER]';
    case 'major':
      return '[MAJOR]';
    case 'minor':
      return '[minor]';
    case 'info':
      return '[info]';
  }
}

function renderFinding(f: GateFinding): string {
  const parts: string[] = [`- ${severityBadge(f.severity)} ${f.message}`];
  if (f.component) parts.push(`  - component: \`${f.component}\``);
  if (f.file) parts.push(`  - file: \`${f.file}\``);
  if (f.suggestion) parts.push(`  - suggestion: ${f.suggestion}`);
  return parts.join('\n');
}

export function renderMarkdownReport(report: AuditReport): string {
  const { summary, gates, generated_at, repo_root, ok } = report;
  const lines: string[] = [];
  lines.push('# Coherence Audit Report');
  lines.push('');
  lines.push(`- Status: **${ok ? 'PASS' : 'FAIL'}**`);
  lines.push(`- Generated at: ${generated_at}`);
  lines.push(`- Repo root: \`${repo_root}\``);
  lines.push(`- Duration: ${summary.duration_ms} ms`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total gates: ${summary.total}`);
  lines.push(`- Passed: ${summary.passed}`);
  lines.push(`- Failed: ${summary.failed}`);
  lines.push(`- Findings — blocker: ${summary.by_severity.blocker}, major: ${summary.by_severity.major}, minor: ${summary.by_severity.minor}, info: ${summary.by_severity.info}`);
  lines.push('');
  lines.push('## Gates');
  lines.push('');
  lines.push('| # | Gate | Status | Findings | Duration |');
  lines.push('| ---: | --- | :---: | ---: | ---: |');
  gates.forEach((g, i) => {
    const status = g.passed ? 'pass' : 'FAIL';
    lines.push(`| ${i + 1} | ${g.name} | ${status} | ${g.findings.length} | ${g.duration_ms} ms |`);
  });
  lines.push('');
  for (const g of gates) {
    if (g.findings.length === 0) continue;
    lines.push(`### ${g.passed ? '' : 'FAIL — '}${g.name}`);
    lines.push('');
    for (const f of g.findings) {
      lines.push(renderFinding(f));
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderConsoleSummary(report: AuditReport): string {
  const { summary, gates, ok } = report;
  const lines: string[] = [];
  const head = ok ? pc.green('PASS') : pc.red('FAIL');
  lines.push(`${head} ${summary.passed}/${summary.total} gates · ${summary.duration_ms} ms`);
  lines.push(
    `findings — ${pc.red(`blocker: ${summary.by_severity.blocker}`)}, ${pc.yellow(`major: ${summary.by_severity.major}`)}, minor: ${summary.by_severity.minor}, info: ${summary.by_severity.info}`,
  );
  for (const g of gates) {
    const mark = g.passed ? pc.green('ok  ') : pc.red('FAIL');
    lines.push(`  ${mark} ${g.name.padEnd(36)} ${String(g.findings.length).padStart(3)} findings  ${g.duration_ms} ms`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runAudit(options: RunAuditOptions): Promise<AuditReport> {
  const logger = options.logger ?? createLogger();
  const repoRoot = path.resolve(options.repoRoot);

  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  const startedAt = Date.now();

  const ctx = await loadAuditContext(repoRoot, { logger });
  const loaded = await discoverGates(thisFileDir, logger);
  logger.debug(`discovered ${loaded.length} gates`);

  const results = await Promise.all(loaded.map((g) => runGateSafely(g.gate, ctx)));
  const totalDuration = Date.now() - startedAt;

  const summary = summarize(results, totalDuration);
  const report: AuditReport = {
    ok: results.every((r) => r.passed),
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    summary,
    gates: results,
  };

  if (options.writeReport !== false) {
    const out = options.reportPath ?? path.join(repoRoot, 'coherence-report.md');
    await fs.writeFile(out, renderMarkdownReport(report), 'utf8');
    logger.info(`report written to ${path.relative(repoRoot, out) || out}`);
  }

  return report;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliFlags {
  json: boolean;
  verbose: boolean;
  repoRoot: string;
}

function parseFlags(argv: string[]): CliFlags {
  let json = false;
  let verbose = false;
  let repoRoot: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--json') json = true;
    else if (a === '--verbose' || a === '-v') verbose = true;
    else if (a === '--repo' || a === '--repo-root') {
      const next = argv[i + 1];
      if (next) {
        repoRoot = next;
        i += 1;
      }
    }
  }
  return {
    json,
    verbose,
    repoRoot: repoRoot ?? defaultRepoRoot(),
  };
}

function defaultRepoRoot(): string {
  // run.ts lives at `<repo>/scripts/audit-coherence/run.ts`
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..', '..');
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const logger = createLogger(flags.verbose);
  const report = await runAudit({
    repoRoot: flags.repoRoot,
    logger,
    writeReport: !flags.json,
  });

  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    process.stdout.write(renderConsoleSummary(report) + '\n');
  }

  process.exit(report.ok ? 0 : 1);
}

const invokedDirectly = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(path.resolve(entry)).href === import.meta.url;
  } catch {
    return false;
  }
})();

if (invokedDirectly) {
  main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`audit runner crashed: ${message}\n`);
    if (err instanceof Error && err.stack) {
      process.stderr.write(err.stack + '\n');
    }
    process.exit(1);
  });
}

export default runAudit;
