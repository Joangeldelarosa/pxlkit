/**
 * Gate 24 — prop-naming-vocabulary.
 *
 * Canonical prop vocabulary enforced across the entire UI kit. The kit lives
 * or dies on the consumer's ability to predict a component's API from another
 * component's API. If `PixelButton` takes `tone` and `PixelBadge` takes
 * `color`, the kit feels like a Frankenstein — even when both work.
 *
 * This gate scans every `Props` interface / type alias in shippable source
 * (no tests, no stories, no examples, no manifests) and flags any prop name
 * that lives in our forbidden-vocabulary table. Each match emits a `major`
 * finding with an ACTIONABLE suggestion ("rename `color` → `tone`") so the
 * fix is mechanical.
 *
 * Canonical dictionary (intent → name → forbidden aliases):
 *
 *   - visual mood          → tone        (NOT color, variantColor, theme, intent, palette)
 *   - dimensional scale    → size        (NOT scale, magnitude, dimension)
 *   - structural variant   → variant     (NOT kind, style, type — when type means visual variant)
 *   - aesthetic mode       → surface     (NOT mode, aesthetic, look, skin)
 *   - interactive disabled → disabled    (NOT inactive, locked, frozen)
 *   - in-flight UI         → loading     (NOT busy, pending, waiting — those are aria-*)
 *   - change callback      → onChange    (NOT onUpdate, onValueChange, onChanged)
 *   - controlled value     → value       (NOT currentValue, val, selectedValue)
 *   - uncontrolled value   → defaultValue (NOT initialValue, initValue, startValue)
 *   - human-readable text  → label       (NOT title for non-heading components, NOT caption, NOT text)
 *
 * Exemptions (pragmatic — kept tight):
 *
 *   - HTMLDataElement-mandated names like `data-*` / `aria-*` pass through.
 *   - Native React props the runtime mandates (`children`, `key`, `ref`,
 *     `className`, `style`, `id`, `name`, `tabIndex`, `role`, `htmlFor`, etc.).
 *   - React Hook Form contexts (`onValueChange` IS allowed when the file imports
 *     `react-hook-form` and the prop signature carries an RHF Controller render-prop
 *     shape — see `isRhfContext()` for the heuristic).
 *   - `type` is allowed when the prop is clearly a native HTML input type union
 *     (`'button' | 'submit' | 'reset' | ...`) — the gate inspects the type
 *     literal on the same line.
 *
 * Programmatic API:
 *
 *     import gate, { PropNamingVocabularyGate } from './24-prop-naming-vocabulary.js';
 *     const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *
 *     tsx scripts/audit-coherence/gates/24-prop-naming-vocabulary.ts \
 *       [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — no violations found
 *   1 — at least one major (or blocker) violation surfaced
 *
 * Safety: read-only. Globs and reads *.tsx / *.ts files under
 * `packages/* /src/**`; never imports or executes source code.
 */

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
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Canonical vocabulary — single source of truth for the rule set.
// ---------------------------------------------------------------------------

/**
 * A single forbidden-prop rule. `aliases` are case-sensitive — React props
 * are camelCase by convention and we do not want to flag arbitrary
 * lowercase synonyms accidentally.
 */
export interface VocabularyRule {
  /** Canonical name consumers expect to see. */
  canonical: string;
  /** Short human label for the intent — drives the finding message. */
  intent: string;
  /** Disallowed aliases that should be renamed to `canonical`. */
  aliases: readonly string[];
  /**
   * Optional per-rule guard: receives the prop block text + the prop line +
   * the file path, and returns true when the alias is exempt in THIS spot
   * (e.g. `type: 'button' | 'submit'` is a native input type, not a visual
   * variant). Default is "no exemption".
   */
  exempt?: (input: {
    propLine: string;
    propsBlock: string;
    file: string;
  }) => boolean;
}

/**
 * The canonical vocabulary. Order matters only for deterministic finding
 * output — first matching rule wins per prop.
 */
export const CANONICAL_VOCABULARY: readonly VocabularyRule[] = Object.freeze([
  {
    canonical: 'tone',
    intent: 'visual mood / color family',
    aliases: ['color', 'variantColor', 'theme', 'intent', 'palette'],
  },
  {
    canonical: 'size',
    intent: 'dimensional scale',
    aliases: ['scale', 'magnitude', 'dimension'],
  },
  {
    canonical: 'variant',
    intent: 'structural variant',
    aliases: ['kind', 'style'],
    // `type` is intentionally NOT in this rule's aliases — see the dedicated
    // rule below which exempts native input-type unions.
  },
  {
    canonical: 'variant',
    intent: 'structural variant (type-as-variant)',
    aliases: ['type'],
    exempt: ({ propLine }) => isNativeHtmlTypeUnion(propLine),
  },
  {
    canonical: 'surface',
    intent: 'aesthetic mode (pixel / linear)',
    aliases: ['mode', 'aesthetic', 'look', 'skin'],
  },
  {
    canonical: 'disabled',
    intent: 'interactive disabled state',
    aliases: ['inactive', 'locked', 'frozen'],
  },
  {
    canonical: 'loading',
    intent: 'in-flight UI state',
    // `busy` / `pending` belong on aria-busy / aria-pending — flag them on
    // non-aria props so the consumer either renames them or uses the ARIA
    // attribute directly.
    aliases: ['busy', 'pending', 'waiting'],
  },
  {
    canonical: 'onChange',
    intent: 'change callback',
    aliases: ['onUpdate', 'onChanged', 'onValueChange'],
    // `onValueChange` is allowed only inside a react-hook-form Controller
    // render-prop context (rare but real). The default exempt() is replaced
    // at gate-construction time so we can inspect the file's import set.
  },
  {
    canonical: 'value',
    intent: 'controlled value',
    aliases: ['currentValue', 'selectedValue', 'val'],
  },
  {
    canonical: 'defaultValue',
    intent: 'uncontrolled initial value',
    aliases: ['initialValue', 'initValue', 'startValue'],
  },
  {
    canonical: 'label',
    intent: 'human-readable text label',
    // `title` is allowed on heading-like components (h1-h6 wrappers, modals,
    // page titles). Flag it everywhere else.
    aliases: ['title', 'caption', 'text'],
    exempt: ({ file, propsBlock }) => isHeadingLikeContext(file, propsBlock),
  },
]);

/** Props that are universally exempt regardless of rule. */
const UNIVERSAL_EXEMPTIONS: ReadonlySet<string> = new Set([
  'children',
  'key',
  'ref',
  'className',
  'style',
  'id',
  'name',
  'tabIndex',
  'role',
  'htmlFor',
  'autoFocus',
  'autoComplete',
  // React Hook Form `register` field — usable on any input wrapper.
  'register',
  'control',
  // Native HTML attrs that map 1:1 to DOM.
  'form',
  'placeholder',
  'maxLength',
  'minLength',
  'pattern',
  'required',
  'readOnly',
  'spellCheck',
  'autoCapitalize',
  'inputMode',
  'enterKeyHint',
]);

// ---------------------------------------------------------------------------
// Contextual heuristics
// ---------------------------------------------------------------------------

/**
 * Detect when a prop named `type` is actually a native HTML input-type union
 * (`'button' | 'submit' | 'reset'` etc.). Conservative: we look for at least
 * two of the well-known HTML input-type literals on the same line.
 */
export function isNativeHtmlTypeUnion(propLine: string): boolean {
  const NATIVE_TYPES = [
    'button',
    'submit',
    'reset',
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'time',
    'datetime-local',
    'file',
    'hidden',
    'checkbox',
    'radio',
    'range',
    'color',
    'month',
    'week',
  ];
  let hits = 0;
  for (const lit of NATIVE_TYPES) {
    if (propLine.includes(`'${lit}'`) || propLine.includes(`"${lit}"`)) hits++;
    if (hits >= 2) return true;
  }
  return false;
}

/**
 * Detect when `title` is legitimately a heading-level label. Heuristic:
 *   - file basename hints at a heading-like component (`Heading`, `Title`,
 *     `Modal`, `Dialog`, `Drawer`, `Sheet`, `PageHeader`, `Hero`), OR
 *   - the Props block also declares `subtitle`, `description`, or `level` —
 *     all strong indicators of a heading context.
 */
export function isHeadingLikeContext(
  file: string,
  propsBlock: string,
): boolean {
  const base = path.basename(file).toLowerCase();
  const HEADING_HINTS = [
    'heading',
    'title',
    'modal',
    'dialog',
    'drawer',
    'sheet',
    'pageheader',
    'hero',
    'banner',
  ];
  if (HEADING_HINTS.some((h) => base.includes(h))) return true;
  return (
    /\bsubtitle\??\s*:/.test(propsBlock) ||
    /\bdescription\??\s*:/.test(propsBlock) ||
    /\blevel\??\s*:\s*(?:1|2|3|4|5|6|number)/.test(propsBlock)
  );
}

/**
 * Detect when a file uses react-hook-form. When true, `onValueChange` is
 * allowed (RHF Controller render-prop API uses it natively).
 */
export function isRhfContext(source: string): boolean {
  return (
    /from\s+['"]react-hook-form['"]/.test(source) ||
    /from\s+['"]@hookform\//.test(source)
  );
}

// ---------------------------------------------------------------------------
// Props-block extraction — regex-based, intentionally lo-fi so we never have
// to bundle a TS AST parser into the audit binary.
// ---------------------------------------------------------------------------

export interface PropsBlock {
  /** Identifier of the Props interface / type alias (e.g. `PixelButtonProps`). */
  name: string;
  /** 1-based line number where the block opens (the `interface ... {` line). */
  startLine: number;
  /** Raw textual body of the block — everything BETWEEN the braces. */
  body: string;
}

export interface PropDeclaration {
  /** Bare prop name as it appears (e.g. `color`, `data-testid`). */
  name: string;
  /** 1-based absolute line number in the source file. */
  line: number;
  /** Full line text — used for inline exemption checks. */
  lineText: string;
}

/**
 * Find every `(export )?interface XxxProps { ... }` and
 * `(export )?type XxxProps = { ... }` block in `source`. Brace-balanced so
 * nested type literals don't break the scan.
 */
export function extractPropsBlocks(source: string): PropsBlock[] {
  const out: PropsBlock[] = [];
  const RX = /(?:export\s+)?(?:interface|type)\s+([A-Z][A-Za-z0-9_]*Props)\b[^{=]*?[={]/g;
  let match: RegExpExecArray | null;
  while ((match = RX.exec(source)) !== null) {
    const headerEnd = match.index + match[0].length;
    // `match[0]` ends on the `{` (interface) or on the `=` (type alias). For
    // `type`, advance to the next `{` if any — bail otherwise (it's likely a
    // union type alias, not a record we can scan).
    let openIdx = source[headerEnd - 1] === '{' ? headerEnd - 1 : source.indexOf('{', headerEnd);
    if (openIdx < 0) continue;
    const closeIdx = findMatchingBrace(source, openIdx);
    if (closeIdx < 0) continue;
    const body = source.slice(openIdx + 1, closeIdx);
    const startLine = source.slice(0, match.index).split(/\r?\n/).length;
    out.push({ name: match[1], startLine, body });
  }
  return out;
}

function findMatchingBrace(source: string, openIdx: number): number {
  let depth = 0;
  let inString: '"' | "'" | '`' | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Extract prop declarations from a Props block body. Captures top-level prop
 * lines only — nested object-type literals are skipped because their inner
 * fields are not props of the component.
 *
 * Matches lines like:
 *   `  color?: 'red' | 'blue';`
 *   `  onChange: (v: string) => void;`
 *   `  ['data-testid']?: string;`
 *   `  readonly size: Size;`
 */
export function extractPropDeclarations(
  body: string,
  blockStartLine: number,
): PropDeclaration[] {
  const out: PropDeclaration[] = [];
  const lines = body.split(/\r?\n/);
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    // Track nested-brace depth so we only report top-level props.
    const openCount = (raw.match(/\{/g) ?? []).length;
    const closeCount = (raw.match(/\}/g) ?? []).length;
    const prevDepth = depth;
    depth += openCount - closeCount;
    if (depth < 0) depth = 0;
    if (prevDepth > 0) continue;

    const lineText = raw.trim();
    if (!lineText || lineText.startsWith('//') || lineText.startsWith('*') || lineText.startsWith('/*')) {
      continue;
    }
    // Bracketed string props: ['data-testid']?: string;
    const bracketed = /^\[\s*['"]([^'"]+)['"]\s*\]\s*\??\s*:/.exec(lineText);
    if (bracketed) {
      out.push({
        name: bracketed[1],
        line: blockStartLine + i,
        lineText,
      });
      continue;
    }
    // Plain identifier props: foo?: string;  or  readonly foo: string;
    const plain = /^(?:readonly\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\??\s*:/.exec(lineText);
    if (plain) {
      out.push({
        name: plain[1],
        line: blockStartLine + i,
        lineText,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-file analysis
// ---------------------------------------------------------------------------

export interface VocabularyViolation {
  file: string;
  component: string;
  propsInterface: string;
  propName: string;
  canonical: string;
  intent: string;
  line: number;
  lineText: string;
}

/**
 * Analyse a single file's source text for vocabulary violations.
 *
 * Pure — no I/O. Tests call this directly with inline source strings.
 */
export function analyseSource(
  file: string,
  source: string,
  vocabulary: readonly VocabularyRule[] = CANONICAL_VOCABULARY,
): VocabularyViolation[] {
  const violations: VocabularyViolation[] = [];
  const blocks = extractPropsBlocks(source);
  if (blocks.length === 0) return violations;

  const rhf = isRhfContext(source);
  const component = deriveComponentName(file);

  for (const block of blocks) {
    const props = extractPropDeclarations(block.body, block.startLine);
    for (const prop of props) {
      if (UNIVERSAL_EXEMPTIONS.has(prop.name)) continue;
      if (prop.name.startsWith('aria-') || prop.name.startsWith('data-')) continue;
      if (prop.name.startsWith('on') && prop.name === 'onSubmit') continue;
      // Find the first rule whose aliases include this prop.
      for (const rule of vocabulary) {
        if (!rule.aliases.includes(prop.name)) continue;
        if (rule.canonical === prop.name) continue;
        // RHF carve-out for onValueChange.
        if (rhf && prop.name === 'onValueChange') break;
        if (rule.exempt?.({ propLine: prop.lineText, propsBlock: block.body, file })) {
          break;
        }
        violations.push({
          file,
          component,
          propsInterface: block.name,
          propName: prop.name,
          canonical: rule.canonical,
          intent: rule.intent,
          line: prop.line,
          lineText: prop.lineText,
        });
        break;
      }
    }
  }
  return violations;
}

function deriveComponentName(file: string): string {
  const base = path.basename(file).replace(/\.tsx?$/, '');
  return base;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

const SOURCE_GLOB = ['packages/*/src/**/*.tsx', 'packages/*/src/**/*.ts'];
const SOURCE_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
  '**/*.manifest.ts',
  '**/manifest.ts',
];

export async function discoverSourceFiles(
  ctx: AuditContext,
): Promise<string[]> {
  const files = await fgGlob(SOURCE_GLOB, {
    cwd: ctx.repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: SOURCE_IGNORE,
  });
  return files.map((f) => toPosix(f)).sort();
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export interface PropNamingVocabularyGateOptions {
  /**
   * Override file discovery — tests use this to inject a fixed file list so
   * the gate can be exercised against in-memory fixtures.
   */
  discoverFiles?: (ctx: AuditContext) => Promise<string[]>;
  /**
   * Override source reading. Tests inject a stub so the gate can run on
   * synthetic source strings without touching the filesystem.
   */
  readSource?: (file: string) => Promise<string>;
  /**
   * Override the vocabulary rule set. Defaults to {@link CANONICAL_VOCABULARY}.
   */
  vocabulary?: readonly VocabularyRule[];
}

export class PropNamingVocabularyGate extends Gate {
  readonly id = 24;
  readonly name = 'prop-naming-vocabulary';
  readonly description =
    'Enforce canonical prop vocabulary (tone/size/variant/surface/disabled/loading/onChange/value/defaultValue/label) across all Props interfaces. Major on every alias.';

  private readonly discover: (ctx: AuditContext) => Promise<string[]>;
  private readonly readSourceImpl: (file: string) => Promise<string>;
  private readonly vocabulary: readonly VocabularyRule[];

  constructor(options: PropNamingVocabularyGateOptions = {}) {
    super();
    this.discover = options.discoverFiles ?? discoverSourceFiles;
    this.readSourceImpl = options.readSource ?? defaultReadSource;
    this.vocabulary = options.vocabulary ?? CANONICAL_VOCABULARY;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const files = await this.discover(ctx);

    if (files.length === 0) {
      ctx.logger.debug(
        'prop-naming-vocabulary: no source files found — gate passes vacuously',
      );
      return gateOk(this.name, Date.now() - started);
    }

    const findings: GateFinding[] = [];

    for (const file of files) {
      let source: string;
      try {
        source = await this.readSourceImpl(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.logger.debug(`skipping unreadable source ${file}: ${message}`);
        continue;
      }
      const violations = analyseSource(file, source, this.vocabulary);
      for (const v of violations) {
        findings.push(toFinding(v));
      }
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }
}

function toFinding(v: VocabularyViolation): GateFinding {
  const where = `${v.file}:${v.line}`;
  return {
    severity: 'major',
    file: v.file,
    component: v.component,
    message: `Prop "${v.propName}" on \`${v.propsInterface}\` (${where}) breaks canonical vocabulary — the kit uses "${v.canonical}" for ${v.intent}.`,
    suggestion: buildSuggestion(v),
  };
}

function buildSuggestion(v: VocabularyViolation): string {
  // Provide a near-mechanical replacement the consumer can paste.
  const renamed = v.lineText.replace(
    new RegExp(`\\b${escapeRegex(v.propName)}\\b`),
    v.canonical,
  );
  return [
    `Rename "${v.propName}" to "${v.canonical}".`,
    `  was: ${v.lineText}`,
    `  use: ${renamed}`,
    `Then update every callsite (e.g. \`<${v.component} ${v.propName}={...}\` → \`<${v.component} ${v.canonical}={...}>\`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.`,
  ].join('\n');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function defaultReadSource(file: string): Promise<string> {
  return fs.readFile(file, 'utf8');
}

const gate = new PropNamingVocabularyGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
  } catch {
    return false;
  }
}

async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const verbose = args.includes('--verbose');
  const repoArgIdx = args.findIndex((a) => a === '--repo' || a === '--root');
  const repoRoot =
    repoArgIdx >= 0 && args[repoArgIdx + 1]
      ? path.resolve(args[repoArgIdx + 1]!)
      : path.resolve(process.cwd());

  const logger = createLogger(verbose);
  const ctx = await loadAuditContext(repoRoot, { logger });
  const result = await gate.run(ctx);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const status = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(
      `[gate ${gate.id} ${gate.name}] ${status} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(`  - ${pc.yellow(f.severity)}${who}${where}: ${f.message}\n`);
      if (f.suggestion) {
        process.stdout.write(`      ↳ ${f.suggestion.split('\n').join('\n        ')}\n`);
      }
    }
  }

  process.exit(result.passed ? 0 : 1);
}

if (isMainModule()) {
  cli().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`fatal: ${message}\n`);
    process.exit(1);
  });
}
