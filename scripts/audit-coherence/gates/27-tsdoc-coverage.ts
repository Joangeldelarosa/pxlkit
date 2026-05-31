/**
 * Gate 27 — tsdoc-coverage.
 *
 * For every public Props interface / type alias exported by a package, this
 * gate measures the percentage of fields that carry a well-formed TSDoc
 * leading comment (`/** ... *\/`). Missing TSDoc surfaces as an `info`-level
 * finding — NEVER blocking. The intent is to make the coverage matrix loud,
 * not to gate releases on it. Over time we aim for 100%.
 *
 * What counts as a "public Props" surface?
 *   - An `export interface XxxProps` declaration, OR
 *   - An `export type XxxProps = { ... }` declaration with an object literal
 *     on the right-hand side.
 *   - Names matching the `*Props` suffix (case-sensitive) are picked up. The
 *     gate is intentionally noisy on naming so the convention is reinforced.
 *
 * What counts as "documented"?
 *   - The field has a leading block comment immediately preceding it of the
 *     form `/** ... *\/`. Single-line `//` comments DO NOT count — the
 *     coverage matrix is specifically about API-doc-grade comments that
 *     downstream tools (TypeDoc, react-docgen) can extract.
 *   - The comment MUST parse cleanly via @microsoft/tsdoc; a comment that
 *     parses with non-trivial errors is reported as INFO with the parser
 *     messages so the maintainer knows what to fix.
 *
 * Output shape (in addition to standard findings):
 *   - Each finding carries the component name (derived from file basename)
 *     and the field name.
 *   - The `suggestion` field is ACTIONABLE — it gives a copy-paste TSDoc
 *     skeleton, including a `@default` hint when the field is optional.
 *   - Per-component coverage percentages are exposed via the programmatic
 *     `analyse()` helper for callers that want to render a matrix (e.g. the
 *     orchestrator's report builder).
 *
 * Programmatic API:
 *
 *     const gate = new TsdocCoverageGate();
 *     const result = await gate.run(ctx);
 *     // For richer output:
 *     const matrix = await gate.analyse(ctx);
 *
 * CLI:
 *
 *     tsx scripts/audit-coherence/gates/27-tsdoc-coverage.ts \
 *       [--root <dir>] [--json] [--quiet]
 *
 * Exit codes:
 *   0 — gate ran successfully; INFO findings never fail the gate.
 *   1 — internal error (e.g. failed to load the audit context, TypeScript
 *       compiler API unavailable).
 *
 * Safety: read-only. Touches only source files via the TypeScript program
 * API; writes nothing to disk.
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as pc from 'picocolors';
import * as ts from 'typescript';
import { TSDocParser, TSDocConfiguration } from '@microsoft/tsdoc';

import {
  Gate,
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

export interface FieldRecord {
  /** Field name as authored. */
  name: string;
  /** True if the field is optional (`?:` form). */
  optional: boolean;
  /** Best-effort serialised type text. Used in the actionable suggestion. */
  typeText: string;
  /** True iff a `/** *\/` block comment precedes the field. */
  hasTsdoc: boolean;
  /**
   * If `hasTsdoc` is true and the comment failed to parse cleanly, the parser
   * messages are surfaced here. Empty array on a clean parse or no comment.
   */
  tsdocParseMessages: string[];
  /** Absolute file the field was discovered in. */
  file: string;
  /** Component name derived from the file basename. */
  component: string;
  /** Owning Props interface/type name. */
  propsName: string;
  /** 1-based line where the field starts (for navigation in editor links). */
  line: number;
}

export interface ComponentCoverage {
  component: string;
  file: string;
  propsName: string;
  totalFields: number;
  documentedFields: number;
  /** 0–100 integer percentage, rounded. 0 fields → 100. */
  percent: number;
  fields: FieldRecord[];
}

export interface CoverageMatrix {
  perComponent: ComponentCoverage[];
  totalFields: number;
  documentedFields: number;
  /** Aggregate 0–100 integer percentage across all surfaces. */
  overallPercent: number;
}

export interface TsdocCoverageGateOptions {
  /**
   * Override file discovery. When omitted, the gate scans
   * `packages/* /src/**\/*.tsx` (excluding tests, stories, examples).
   */
  discoverSources?: (ctx: AuditContext) => Promise<string[]>;
  /**
   * Override the source-text reader — used by unit tests to feed synthetic
   * TS sources without touching the filesystem.
   */
  readSource?: (file: string) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_NAME = 'tsdoc-coverage';
const SOURCE_GLOB = 'packages/*/src/**/*.tsx';
const SOURCE_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
  '**/*.test.tsx',
  '**/*.spec.tsx',
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function deriveComponentName(file: string): string {
  const base = path.basename(file).replace(/\.tsx$/, '');
  return base;
}

function isPropsName(name: string): boolean {
  // Picks up PixelButtonProps, FooProps, etc. Excludes plain "Props" alone.
  return /[A-Za-z0-9_$]Props$/.test(name);
}

/**
 * Return true iff the property signature is preceded by a `/** *\/` block
 * comment. JSDoc/TSDoc comments are block comments whose first non-`/*`
 * character is `*` (i.e. they look like `/**`). Single-line `//` comments and
 * plain `/* *\/` block comments DO NOT count.
 */
function hasLeadingTsdoc(node: ts.Node, fullText: string): {
  has: boolean;
  commentText: string | null;
} {
  const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
  if (!ranges || ranges.length === 0) return { has: false, commentText: null };
  // Walk in reverse to find the closest preceding block comment.
  for (let i = ranges.length - 1; i >= 0; i--) {
    const r = ranges[i];
    if (r.kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const text = fullText.slice(r.pos, r.end);
    if (text.startsWith('/**') && text.endsWith('*/') && text.length >= 5) {
      return { has: true, commentText: text };
    }
  }
  return { has: false, commentText: null };
}

function parseTsdocMessages(commentText: string): string[] {
  const config = new TSDocConfiguration();
  const parser = new TSDocParser(config);
  const ctx = parser.parseString(commentText);
  // Surface only error-level messages — warnings about unknown tags are too
  // noisy across a codebase that hasn't adopted the strict config yet.
  return ctx.log.messages
    .filter((m) => m.messageId && /^tsdoc-/.test(m.messageId))
    .map((m) => `${m.messageId}: ${m.unformattedText}`);
}

function safeTypeText(node: ts.PropertySignature, sourceText: string): string {
  if (!node.type) return 'unknown';
  const start = node.type.getStart();
  const end = node.type.getEnd();
  return sourceText.slice(start, end).trim();
}

function suggestionFor(field: FieldRecord): string {
  const headline = field.optional
    ? `What "${field.name}" controls (1 sentence). Defaults to ...`
    : `What "${field.name}" controls (1 sentence).`;
  const tagLine = field.optional ? `\n *\n * @default <value>` : '';
  return [
    `Add a TSDoc block before the field:`,
    `/**`,
    ` * ${headline}${tagLine}`,
    ` */`,
    `${field.name}${field.optional ? '?' : ''}: ${field.typeText};`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Discovery + parsing
// ---------------------------------------------------------------------------

async function discoverSourcesDefault(ctx: AuditContext): Promise<string[]> {
  const files = await fgGlob(SOURCE_GLOB, {
    cwd: ctx.repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: SOURCE_IGNORE,
  });
  return files.map((f) => toPosix(f)).sort();
}

async function readSourceDefault(file: string): Promise<string> {
  return fs.readFile(file, 'utf8');
}

/**
 * Walk a single SourceFile and extract every exported Props
 * interface/type-alias member. Each member is returned as a FieldRecord with
 * its TSDoc-presence flag pre-computed.
 */
export function extractFieldsFromSource(
  file: string,
  text: string,
): FieldRecord[] {
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );
  const component = deriveComponentName(file);
  const out: FieldRecord[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isInterfaceDeclaration(node) && hasExportKeyword(node) && isPropsName(node.name.text)) {
      const propsName = node.name.text;
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name) {
          const fieldName = propertyNameText(member.name);
          if (!fieldName) continue;
          const probe = hasLeadingTsdoc(member, text);
          const parseMsgs = probe.commentText
            ? parseTsdocMessages(probe.commentText)
            : [];
          out.push({
            name: fieldName,
            optional: !!member.questionToken,
            typeText: safeTypeText(member, text),
            hasTsdoc: probe.has,
            tsdocParseMessages: parseMsgs,
            file,
            component,
            propsName,
            line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
          });
        }
      }
    } else if (
      ts.isTypeAliasDeclaration(node) &&
      hasExportKeyword(node) &&
      isPropsName(node.name.text)
    ) {
      const propsName = node.name.text;
      const t = node.type;
      if (ts.isTypeLiteralNode(t)) {
        for (const member of t.members) {
          if (ts.isPropertySignature(member) && member.name) {
            const fieldName = propertyNameText(member.name);
            if (!fieldName) continue;
            const probe = hasLeadingTsdoc(member, text);
            const parseMsgs = probe.commentText
              ? parseTsdocMessages(probe.commentText)
              : [];
            out.push({
              name: fieldName,
              optional: !!member.questionToken,
              typeText: safeTypeText(member, text),
              hasTsdoc: probe.has,
              tsdocParseMessages: parseMsgs,
              file,
              component,
              propsName,
              line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return out;
}

function hasExportKeyword(node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): boolean {
  const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!mods) return false;
  return mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name)) return name.text;
  if (ts.isNumericLiteral(name)) return name.text;
  return null;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export function aggregateCoverage(fields: FieldRecord[]): CoverageMatrix {
  // Group by `${file}::${propsName}` so two Props interfaces in the same file
  // get their own row.
  const groups = new Map<string, FieldRecord[]>();
  for (const f of fields) {
    const key = `${f.file}::${f.propsName}`;
    const list = groups.get(key) ?? [];
    list.push(f);
    groups.set(key, list);
  }
  const perComponent: ComponentCoverage[] = [];
  for (const [, list] of groups) {
    const documented = list.filter((f) => f.hasTsdoc).length;
    const total = list.length;
    const percent = total === 0 ? 100 : Math.round((documented / total) * 100);
    perComponent.push({
      component: list[0].component,
      file: list[0].file,
      propsName: list[0].propsName,
      totalFields: total,
      documentedFields: documented,
      percent,
      fields: list,
    });
  }
  perComponent.sort((a, b) =>
    a.component === b.component
      ? a.propsName.localeCompare(b.propsName)
      : a.component.localeCompare(b.component),
  );
  const totalFields = fields.length;
  const documentedFields = fields.filter((f) => f.hasTsdoc).length;
  const overallPercent =
    totalFields === 0 ? 100 : Math.round((documentedFields / totalFields) * 100);
  return { perComponent, totalFields, documentedFields, overallPercent };
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export class TsdocCoverageGate extends Gate {
  readonly id = 27;
  readonly name = GATE_NAME;
  readonly description =
    'Coverage matrix of TSDoc-documented fields on every public Props surface. INFO-only — never blocks. Aim for 100% over time.';

  private readonly discover: (ctx: AuditContext) => Promise<string[]>;
  private readonly read: (file: string) => Promise<string>;

  constructor(options: TsdocCoverageGateOptions = {}) {
    super();
    this.discover = options.discoverSources ?? discoverSourcesDefault;
    this.read = options.readSource ?? readSourceDefault;
  }

  /**
   * Programmatic helper for callers that want the full coverage matrix
   * (e.g. orchestrator report builder, docs site). The gate's `run()`
   * funnels through this so the two views stay aligned.
   */
  async analyse(ctx: AuditContext): Promise<CoverageMatrix> {
    const files = await this.discover(ctx);
    const all: FieldRecord[] = [];
    for (const file of files) {
      let text: string;
      try {
        text = await this.read(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.logger.warn(`tsdoc-coverage: failed to read ${file}: ${message}`);
        continue;
      }
      try {
        const recs = extractFieldsFromSource(file, text);
        all.push(...recs);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.logger.warn(`tsdoc-coverage: failed to parse ${file}: ${message}`);
      }
    }
    return aggregateCoverage(all);
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const matrix = await this.analyse(ctx);

    const findings: GateFinding[] = [];

    for (const row of matrix.perComponent) {
      // Per-component summary INFO so the matrix is visible even when 100%.
      findings.push({
        severity: 'info',
        file: toPosix(row.file),
        component: row.component,
        message: `${row.propsName}: ${row.documentedFields}/${row.totalFields} fields documented (${row.percent}%).`,
        suggestion:
          row.percent === 100
            ? 'No action needed — coverage at 100%.'
            : `Document the remaining ${row.totalFields - row.documentedFields} field(s) below.`,
      });

      for (const field of row.fields) {
        if (!field.hasTsdoc) {
          findings.push({
            severity: 'info',
            file: `${toPosix(field.file)}:${field.line}`,
            component: field.component,
            message: `${row.propsName}.${field.name} has no TSDoc.`,
            suggestion: suggestionFor(field),
          });
        } else if (field.tsdocParseMessages.length > 0) {
          findings.push({
            severity: 'info',
            file: `${toPosix(field.file)}:${field.line}`,
            component: field.component,
            message: `${row.propsName}.${field.name} TSDoc parsed with messages: ${field.tsdocParseMessages.join('; ')}`,
            suggestion:
              'Fix the TSDoc syntax errors above. Common culprit: unbalanced inline tags ({@link foo} without closing }), unknown @tag, or empty summary.',
          });
        }
      }
    }

    // Aggregate summary as the first finding so the orchestrator can render
    // it as a one-line dashboard.
    findings.unshift({
      severity: 'info',
      message: `Overall TSDoc coverage: ${matrix.documentedFields}/${matrix.totalFields} fields (${matrix.overallPercent}%) across ${matrix.perComponent.length} Props surface(s).`,
      suggestion:
        matrix.overallPercent === 100
          ? 'Coverage at 100%. Add a CI assertion to keep it there.'
          : `Target 100%. Today's gap: ${matrix.totalFields - matrix.documentedFields} undocumented field(s).`,
    });

    // INFO never blocks: always return gateOk regardless of finding count.
    const result = gateOk(this.name, Date.now() - started);
    result.findings = findings;
    return result;
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
          'Usage: tsx scripts/audit-coherence/gates/27-tsdoc-coverage.ts [options]',
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
  const logger: Logger = createLogger(!opts.quiet);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new TsdocCoverageGate();
  const result = await gate.run(ctx);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (!opts.quiet) {
    const badge = result.passed ? pc.green('PASS') : pc.yellow('INFO');
    process.stdout.write(`${badge} ${result.name} (${result.duration_ms}ms)\n`);
    for (const f of result.findings) {
      process.stdout.write(
        `  ${pc.cyan(f.severity)} ${f.component ?? ''} ${f.file ?? ''}\n    ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`    ${pc.dim('-> ' + f.suggestion.split('\n')[0])}\n`);
      }
    }
  }
  // INFO-only gate: success exit regardless of findings.
  return 0;
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
        `tsdoc-coverage failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default TsdocCoverageGate;
