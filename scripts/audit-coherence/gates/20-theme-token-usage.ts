/**
 * Gate 20 — theme-token-usage.
 *
 * Mission: every visual class in `packages/ui-kit/src/**\/*.tsx` must come
 * from the design-system tokens defined in `packages/ui-kit/src/tokens.ts`
 * (the `tone` map: `bg-retro-*`, `border-retro-*`, `text-retro-*`,
 * `fill-retro-*`, plus the alpha-modulated `bg-retro-*\/NN` variants).
 *
 * Why a separate gate?
 *   Core gates check coverage / examples / typings — they don't open files
 *   and read what color the component PAINTS. This one does. It exists to
 *   keep the visual system COHERENT: any time someone slips `bg-gray-500`
 *   or `text-[#0EA5E9]` into a component, the gate catches it before it
 *   becomes a "why is this card slightly off-brand?" Slack thread.
 *
 * Severity model:
 *   - BLOCKER: hardcoded color literal — `bg-[#fff]`, `text-rgb(0,0,0)`,
 *              `border-[hsl(0,0%,100%)]`, etc. These bypass the token
 *              system entirely and are invisible to theme switches.
 *   - MAJOR  : standard Tailwind color palette — `bg-gray-500`,
 *              `text-blue-400`, `border-zinc-700`. Should be replaced by a
 *              `retro-*` token (we suggest the closest tone in `tokens.ts`).
 *   - OK     : `bg-retro-*`, `border-retro-*`, `text-retro-*`, `fill-retro-*`
 *              (with optional `/NN` alpha) — counted for the frequency
 *              table the dashboard reads later.
 *   - SKIPPED: structural color-adjacent utilities that aren't actually
 *              setting a brand color — `bg-transparent`, `bg-current`,
 *              `bg-clip-text`, `bg-gradient-to-r`, `border-0`,
 *              `border-2`, `border-l`, `border-r-transparent`,
 *              `fill-current`, `fill-none`, `text-xs`, `text-left`, etc.
 *
 * Extras:
 *   - We extract from `className="..."`, `className={'...'}`, `cn(...)`,
 *     `clsx(...)`, and bare string literals inside JSX expressions. We do
 *     NOT try to fully parse the TSX — we scan strings, which is robust
 *     for the way this kit writes classes.
 *   - For every component file we emit a frequency table of token-family
 *     usage (`retro-green: 12`, `retro-cyan: 4`, etc.) inside an `info`
 *     finding so the docs dashboard can read it from the JSON report.
 *   - We DO NOT touch any *.tsx file. Read-only.
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Token catalog — kept in sync with packages/ui-kit/src/tokens.ts.
// We list the retro color slugs the design system exposes. Anything outside
// this set that matches `(bg|text|border|fill)-retro-*` is still treated as
// OK (it's a retro token by namespace), but the SUGGESTION engine uses this
// list to recommend the closest match for a violating class.
// ---------------------------------------------------------------------------

export const RETRO_TONES = [
  'neutral',
  'green',
  'cyan',
  'gold',
  'red',
  'purple',
  'pink',
] as const;
export type RetroTone = (typeof RETRO_TONES)[number];

/**
 * Retro token slugs that are valid in `bg|text|border|fill-retro-<slug>`.
 * Includes both the tone color names and the structural-surface names that
 * appear in tokens.ts (`border`, `surface`, `text`, `muted`, `bg`).
 */
const RETRO_VALID_SLUGS = new Set<string>([
  ...RETRO_TONES,
  'border',
  'border-strong',
  'surface',
  'surface-strong',
  'text',
  'muted',
  'bg',
]);

/**
 * Standard Tailwind color palette names. If a class matches
 * `(bg|text|border|fill)-<name>-<shade>` and `<name>` is one of these, it's
 * a MAJOR violation (use a retro token instead).
 */
const TAILWIND_PALETTE_COLORS = new Set<string>([
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]);

/**
 * Standalone color keywords that count as a hardcoded color when used after
 * a color prefix: `bg-black`, `text-white`. (Not `bg-transparent` /
 * `bg-current` — those are structural and we skip them.)
 */
const HARDCODED_KEYWORD_COLORS = new Set<string>(['black', 'white']);

/**
 * Suffixes after `(bg|text|border|fill)-` that we treat as STRUCTURAL and
 * skip entirely. These are not brand colors; they are layout / typography /
 * border-style utilities that happen to share the same prefix.
 */
const STRUCTURAL_SUFFIXES = new Set<string>([
  // bg-*
  'transparent',
  'current',
  'inherit',
  'none',
  'auto',
  'clip',
  'origin',
  'fixed',
  'local',
  'scroll',
  'repeat',
  'no-repeat',
  'cover',
  'contain',
  'top',
  'bottom',
  'left',
  'right',
  'center',
  'gradient',
  'opacity',
  'blend',
  // text-*
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
  'start',
  'end',
  'justify',
  'wrap',
  'nowrap',
  'pretty',
  'balance',
  'ellipsis',
  'clip',
  'truncate',
  'pretty',
  // border-*
  'solid',
  'dashed',
  'dotted',
  'double',
  'hidden',
  'collapse',
  'separate',
  'spacing',
]);

/**
 * Two-segment structural utilities (`bg-clip-text`, `bg-gradient-to-r`,
 * `bg-origin-border`, `text-clip`, `border-r-transparent`, …). We check
 * the SECOND segment of the class against this set when the first segment
 * is a known structural keyword from STRUCTURAL_SUFFIXES.
 */
const STRUCTURAL_PARENTS = new Set<string>([
  'clip',
  'origin',
  'gradient',
  'opacity',
  'blend',
]);

// ---------------------------------------------------------------------------
// Suggestion table — used to recommend a replacement for a violating class.
// We map common standard-Tailwind palette colors to the closest retro tone.
// Conservative on purpose: if a mapping is genuinely ambiguous we suggest
// `tone.neutral` and let the human pick.
// ---------------------------------------------------------------------------

const PALETTE_TO_RETRO_TONE: Readonly<Record<string, RetroTone>> = {
  slate: 'neutral',
  gray: 'neutral',
  zinc: 'neutral',
  neutral: 'neutral',
  stone: 'neutral',
  red: 'red',
  rose: 'red',
  orange: 'gold',
  amber: 'gold',
  yellow: 'gold',
  lime: 'green',
  green: 'green',
  emerald: 'green',
  teal: 'cyan',
  cyan: 'cyan',
  sky: 'cyan',
  blue: 'cyan',
  indigo: 'purple',
  violet: 'purple',
  purple: 'purple',
  fuchsia: 'pink',
  pink: 'pink',
};

/**
 * Maps a class-prefix (`bg` | `text` | `border` | `fill`) onto the tone-map
 * subkey it should resolve to (see tokens.ts `tone[<tone>]`).
 */
const PREFIX_TO_TOKEN_KEY: Readonly<Record<ColorPrefix, keyof ToneEntryShape>> = {
  bg: 'bg',
  text: 'text',
  border: 'border',
  fill: 'fill',
};

interface ToneEntryShape {
  border: string;
  bg: string;
  soft: string;
  glow: string;
  ring: string;
  text: string;
  fill: string;
}

// ---------------------------------------------------------------------------
// Class extraction
// ---------------------------------------------------------------------------

export type ColorPrefix = 'bg' | 'text' | 'border' | 'fill';

export interface ExtractedClass {
  /** The class literal as written (without leading variant chain). */
  raw: string;
  /** Variant chain before the actual utility, e.g. `hover:md:` or '' if none. */
  variant: string;
  /** Color prefix `bg | text | border | fill`. */
  prefix: ColorPrefix;
  /** The portion after the prefix (`-`), preserving alpha modulation. */
  body: string;
  /** 1-based line where the class appears in the source file. */
  line: number;
  /** 1-based column of the class' first char on that line. */
  column: number;
}

/**
 * Regex that captures any string literal whose CONTENTS contain at least
 * one whitespace-separated token starting with a color prefix. We use this
 * to narrow the search before doing per-token splitting. We do NOT try to
 * be a TSX parser — we read string contents.
 */
const STRING_LITERAL_RE = /(['"`])([^'"`\n]*?)\1/g;

const TOKEN_SPLIT_RE = /\s+/;

const COLOR_PREFIX_RE = /^((?:[\w-]+:)*)(bg|text|border|fill)-(.+)$/;

const HEX_BODY_RE = /^\[?#?[0-9a-fA-F]{3,8}\]?(?:\/(?:\d+|\[[^\]]+\]))?$/;
const ARBITRARY_VALUE_RE = /^\[(.+)\]$/;

function lineColOfIndex(source: string, idx: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < idx && i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) {
      line += 1;
      lineStart = i + 1;
    }
  }
  return { line, column: idx - lineStart + 1 };
}

/**
 * Walks the source, finds every string literal, splits its contents on
 * whitespace, and yields tokens that begin with a color prefix.
 * Variant chains (`hover:`, `md:`, `data-[state=open]:`, etc.) are
 * peeled off and reported separately so the suggestion engine can rebuild
 * the replacement preserving variants.
 */
export function extractColorClasses(source: string): ExtractedClass[] {
  const out: ExtractedClass[] = [];
  STRING_LITERAL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = STRING_LITERAL_RE.exec(source)) !== null) {
    const contentStart = m.index + 1; // skip opening quote
    const content = m[2] ?? '';
    if (!content) continue;
    // Quick skip: cheap heuristic — must contain at least one of the four prefixes.
    if (
      !content.includes('bg-') &&
      !content.includes('text-') &&
      !content.includes('border-') &&
      !content.includes('fill-')
    ) {
      continue;
    }
    // Tokenize on whitespace.
    let cursor = 0;
    for (const tok of content.split(TOKEN_SPLIT_RE)) {
      const tokStart = content.indexOf(tok, cursor);
      cursor = tokStart + tok.length;
      if (!tok) continue;
      const match = COLOR_PREFIX_RE.exec(tok);
      if (!match) continue;
      const [, variant = '', prefixRaw = '', body = ''] = match;
      const prefix = prefixRaw as ColorPrefix;
      if (!body) continue;
      const absIdx = contentStart + tokStart;
      const { line, column } = lineColOfIndex(source, absIdx);
      out.push({
        raw: tok,
        variant,
        prefix,
        body,
        line,
        column,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export type ClassVerdict =
  | { kind: 'ok-retro'; toneSlug: string; alpha: string | null }
  | { kind: 'hardcoded'; reason: string }
  | { kind: 'palette'; palette: string; shade: string | null; alpha: string | null }
  | { kind: 'keyword-color'; keyword: string }
  | { kind: 'skip'; reason: string };

function splitAlpha(body: string): { core: string; alpha: string | null } {
  // Split on the LAST `/` that isn't inside `[...]`.
  let depth = 0;
  let cutAt = -1;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body.charCodeAt(i);
    if (ch === 91 /* [ */) depth += 1;
    else if (ch === 93 /* ] */) depth -= 1;
    else if (ch === 47 /* / */ && depth === 0) cutAt = i;
  }
  if (cutAt < 0) return { core: body, alpha: null };
  return { core: body.slice(0, cutAt), alpha: body.slice(cutAt + 1) };
}

/**
 * Decides what a class' body means. Pure — no IO.
 */
export function classifyClassBody(prefix: ColorPrefix, body: string): ClassVerdict {
  const { core, alpha } = splitAlpha(body);

  // Arbitrary value: `bg-[#fff]` / `text-[rgb(0,0,0)]` / `border-[hsl(...)]`
  const arbMatch = ARBITRARY_VALUE_RE.exec(core);
  if (arbMatch) {
    const inner = (arbMatch[1] ?? '').trim();
    if (
      /^#[0-9a-fA-F]{3,8}$/.test(inner) ||
      /^rgb(a)?\(/i.test(inner) ||
      /^hsl(a)?\(/i.test(inner) ||
      /^oklch\(/i.test(inner) ||
      /^lab\(/i.test(inner)
    ) {
      return { kind: 'hardcoded', reason: `arbitrary color value [${inner}]` };
    }
    // Arbitrary non-color values (`text-[length:16px]`, `border-[length:2px]`,
    // `bg-[url(...)]`) are skipped — not in our remit.
    if (/^length:/.test(inner) || /^url\(/i.test(inner) || /px$|rem$|em$|%$/.test(inner)) {
      return { kind: 'skip', reason: 'arbitrary non-color value' };
    }
    // Unknown arbitrary value — treat as hardcoded to be safe.
    return { kind: 'hardcoded', reason: `arbitrary value [${inner}]` };
  }

  // Bare hex like `bg-#fff` (rare but seen in the wild).
  if (HEX_BODY_RE.test(core) && /^#/.test(core)) {
    return { kind: 'hardcoded', reason: `bare hex literal ${core}` };
  }

  // Retro token: `bg-retro-green`, `text-retro-text`, `border-retro-border-strong`.
  if (core.startsWith('retro-')) {
    const slug = core.slice('retro-'.length);
    return { kind: 'ok-retro', toneSlug: slug, alpha };
  }

  // Standard palette: `bg-gray-500`, `text-blue-400`.
  const paletteMatch = /^([a-z]+)-(\d{2,3})$/.exec(core);
  if (paletteMatch) {
    const palette = paletteMatch[1] ?? '';
    const shade = paletteMatch[2] ?? null;
    if (TAILWIND_PALETTE_COLORS.has(palette)) {
      return { kind: 'palette', palette, shade, alpha };
    }
  }

  // Standalone keyword color: `bg-black`, `text-white`.
  if (HARDCODED_KEYWORD_COLORS.has(core)) {
    return { kind: 'keyword-color', keyword: core };
  }

  // Structural one-word suffix: `bg-transparent`, `text-center`, `border-0`.
  if (STRUCTURAL_SUFFIXES.has(core) || /^\d+$/.test(core)) {
    return { kind: 'skip', reason: `structural utility ${prefix}-${core}` };
  }

  // Two-segment structural: `bg-clip-text`, `bg-gradient-to-r`, `border-r-transparent`.
  const firstSeg = core.split('-')[0] ?? '';
  if (STRUCTURAL_PARENTS.has(firstSeg)) {
    return { kind: 'skip', reason: `structural utility ${prefix}-${core}` };
  }
  if (firstSeg === 'r' || firstSeg === 'l' || firstSeg === 't' || firstSeg === 'b' || firstSeg === 'x' || firstSeg === 'y') {
    // `border-r-transparent`, `border-l-2`, etc. — structural side modifier.
    return { kind: 'skip', reason: `structural side utility ${prefix}-${core}` };
  }

  // `text-left | text-right | text-center | text-justify | text-start | text-end`
  // already caught by STRUCTURAL_SUFFIXES. The catch-all for unknown but
  // PLAUSIBLY a color name we don't recognise: still skip — we'd rather a
  // false negative than a false positive that creates noise.
  return { kind: 'skip', reason: `unrecognised body "${core}" — assumed structural` };
}

// ---------------------------------------------------------------------------
// Suggestion engine
// ---------------------------------------------------------------------------

export interface SuggestionInput {
  variant: string;
  prefix: ColorPrefix;
  verdict: ClassVerdict;
}

/**
 * Returns an actionable suggestion string for a violating class. The
 * suggestion includes the suggested replacement class so a human (or a
 * codemod) can copy-paste it.
 */
export function suggestionFor(input: SuggestionInput): string {
  const { variant, prefix, verdict } = input;
  if (verdict.kind === 'palette') {
    const tone = PALETTE_TO_RETRO_TONE[verdict.palette] ?? 'neutral';
    const tokenKey = PREFIX_TO_TOKEN_KEY[prefix];
    // For dark shades (>= 500) and bg/border prefixes the tokens.ts default
    // uses a /18 alpha bg + /30 border; for shades < 500 we suggest /soft (/8).
    // For text/fill we just suggest the bare retro token.
    const shadeNum = verdict.shade ? Number(verdict.shade) : 500;
    let suggestedClass: string;
    if (prefix === 'bg') {
      suggestedClass = shadeNum >= 600 ? `bg-retro-${tone}` : `bg-retro-${tone}/${shadeNum < 400 ? 8 : 18}`;
    } else if (prefix === 'border') {
      suggestedClass = `border-retro-${tone}/30`;
    } else {
      suggestedClass = `${prefix}-retro-${tone}`;
    }
    if (verdict.alpha) {
      // Preserve explicit alpha if the original had one.
      suggestedClass = suggestedClass.replace(/\/\d+$/, '') + `/${verdict.alpha}`;
    }
    const withVariant = `${variant}${suggestedClass}`;
    return `Replace with \`${withVariant}\` (tokens.ts → tone.${tone}.${tokenKey}). Picked because Tailwind \`${verdict.palette}\` ≈ retro \`${tone}\` in the design system.`;
  }
  if (verdict.kind === 'hardcoded') {
    const tokenKey = PREFIX_TO_TOKEN_KEY[prefix];
    return `Hardcoded color (${verdict.reason}) bypasses the token system. Pick a tone from tokens.ts and use \`${variant}${prefix}-retro-<tone>\` (or \`tone.<tone>.${tokenKey}\`). If you need this exact shade, ADD a token to tokens.ts first.`;
  }
  if (verdict.kind === 'keyword-color') {
    return `Standalone \`${prefix}-${verdict.keyword}\` ignores the theme. Use \`${variant}${prefix}-retro-${verdict.keyword === 'black' ? 'text' : 'bg'}\` or \`${variant}${prefix}-retro-neutral\`, whichever matches the surface vs ink intent.`;
  }
  return 'No suggestion — this class did not match a known violation pattern.';
}

// ---------------------------------------------------------------------------
// File processing
// ---------------------------------------------------------------------------

export interface FileScanResult {
  file: string;
  findings: GateFinding[];
  /** Frequency table: `retro-green: 12`, `retro-cyan: 4`, etc. Used by the docs dashboard. */
  retroUsage: Record<string, number>;
  /** Total retro-token references in this file (sum of retroUsage values). */
  retroTotal: number;
  /** Count of blocker-severity findings produced. */
  blockerCount: number;
  /** Count of major-severity findings produced. */
  majorCount: number;
}

export function scanFileSource(
  relFile: string,
  source: string,
): FileScanResult {
  const findings: GateFinding[] = [];
  const retroUsage: Record<string, number> = {};
  let blockerCount = 0;
  let majorCount = 0;

  const classes = extractColorClasses(source);
  for (const c of classes) {
    const verdict = classifyClassBody(c.prefix, c.body);
    if (verdict.kind === 'skip') continue;
    if (verdict.kind === 'ok-retro') {
      const key = `retro-${verdict.toneSlug}`;
      retroUsage[key] = (retroUsage[key] ?? 0) + 1;
      continue;
    }
    const where = `${relFile}:${c.line}:${c.column}`;
    if (verdict.kind === 'hardcoded') {
      blockerCount += 1;
      findings.push({
        severity: 'blocker',
        file: relFile,
        message: `hardcoded color class \`${c.variant}${c.prefix}-${c.body}\` at ${where} — bypasses the design-token system`,
        suggestion: suggestionFor({ variant: c.variant, prefix: c.prefix, verdict }),
      });
      continue;
    }
    if (verdict.kind === 'keyword-color') {
      blockerCount += 1;
      findings.push({
        severity: 'blocker',
        file: relFile,
        message: `standalone color keyword \`${c.variant}${c.prefix}-${c.body}\` at ${where} — bypasses the design-token system`,
        suggestion: suggestionFor({ variant: c.variant, prefix: c.prefix, verdict }),
      });
      continue;
    }
    if (verdict.kind === 'palette') {
      majorCount += 1;
      findings.push({
        severity: 'major',
        file: relFile,
        message: `standard Tailwind palette class \`${c.variant}${c.prefix}-${c.body}\` at ${where} — should use a \`retro-*\` token from tokens.ts`,
        suggestion: suggestionFor({ variant: c.variant, prefix: c.prefix, verdict }),
      });
      continue;
    }
  }

  const retroTotal = Object.values(retroUsage).reduce((a, b) => a + b, 0);
  return { file: relFile, findings, retroUsage, retroTotal, blockerCount, majorCount };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export interface ThemeTokenUsageOptions {
  /**
   * Override the glob used to find component files. Defaults to
   * `packages/ui-kit/src/**\/*.tsx` minus tests/stories.
   */
  includeGlobs?: string[];
  /** Globs to ignore. */
  ignoreGlobs?: string[];
}

const DEFAULT_INCLUDE = ['packages/ui-kit/src/**/*.tsx'];
const DEFAULT_IGNORE = [
  '**/__tests__/**',
  '**/*.test.tsx',
  '**/*.stories.tsx',
  '**/node_modules/**',
  '**/dist/**',
];

export class ThemeTokenUsageGate extends Gate {
  readonly id = 20;
  readonly name = 'theme-token-usage';
  readonly description =
    'Every color class in packages/ui-kit/src must come from tokens.ts (`bg|text|border|fill-retro-*`). Hardcoded colors are blockers; standard Tailwind palette colors are majors. Also emits a per-file frequency table of retro-token usage for the docs dashboard.';

  private readonly options: ThemeTokenUsageOptions;

  constructor(options: ThemeTokenUsageOptions = {}) {
    super();
    this.options = options;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const include = this.options.includeGlobs ?? DEFAULT_INCLUDE;
    const ignore = this.options.ignoreGlobs ?? DEFAULT_IGNORE;

    const files = await fgGlob(include, {
      cwd: ctx.repoRoot,
      absolute: true,
      dot: false,
      onlyFiles: true,
      ignore,
    });

    if (files.length === 0) {
      return {
        name: this.name,
        passed: true,
        duration_ms: Date.now() - started,
        findings: [
          {
            severity: 'info',
            message:
              'no packages/ui-kit/src/**/*.tsx files discovered — theme-token-usage skipped',
            suggestion:
              'ensure --repo points to the monorepo root containing packages/ui-kit/src/',
          },
        ],
      };
    }

    // Aggregate frequency table across all components.
    const globalUsage: Record<string, number> = {};
    const perFileSummary: Array<{
      file: string;
      retroTotal: number;
      retroUsage: Record<string, number>;
      blockerCount: number;
      majorCount: number;
    }> = [];

    for (const abs of files) {
      const relFile = path.relative(ctx.repoRoot, abs).replace(/\\/g, '/');
      let source: string;
      try {
        source = await fs.readFile(abs, 'utf8');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'major',
          file: relFile,
          message: `failed to read ${relFile}: ${message}`,
          suggestion: 'ensure the file is readable and UTF-8 encoded',
        });
        continue;
      }
      const result = scanFileSource(relFile, source);
      findings.push(...result.findings);
      perFileSummary.push({
        file: relFile,
        retroTotal: result.retroTotal,
        retroUsage: result.retroUsage,
        blockerCount: result.blockerCount,
        majorCount: result.majorCount,
      });
      for (const [k, v] of Object.entries(result.retroUsage)) {
        globalUsage[k] = (globalUsage[k] ?? 0) + v;
      }
    }

    // Emit ONE info finding holding the frequency table — the dashboard
    // builder reads `findings[].message` JSON and the suggestion field
    // (we stuff the JSON into `suggestion` so the human-readable column
    // stays clean).
    const summaryPayload = {
      globalUsage,
      perFile: perFileSummary,
      filesScanned: files.length,
    };
    findings.push({
      severity: 'info',
      message: `theme-token frequency table (files=${files.length}, retro-token references=${
        Object.values(globalUsage).reduce((a, b) => a + b, 0)
      })`,
      suggestion: JSON.stringify(summaryPayload),
    });

    const hasBlocking = findings.some((f) => f.severity === 'blocker' || f.severity === 'major');
    if (!hasBlocking) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }
}

const gate = new ThemeTokenUsageGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper — `tsx scripts/audit-coherence/gates/20-theme-token-usage.ts`
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    const url = pathToFileURL(entry).href;
    return import.meta.url === url || import.meta.url.endsWith(path.basename(entry));
  } catch {
    return false;
  }
}

async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const verbose = args.includes('--verbose');
  const repoArgIdx = args.findIndex((a) => a === '--repo');
  const repoRoot =
    repoArgIdx >= 0 && args[repoArgIdx + 1]
      ? path.resolve(args[repoArgIdx + 1]!)
      : path.resolve(process.cwd());

  const { loadAuditContext, createLogger } = await import('../_lib/load-context.js');
  const logger = createLogger(verbose);
  const ctx = await loadAuditContext(repoRoot, { logger });
  const result = await gate.run(ctx);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const status = result.passed ? 'PASS' : 'FAIL';
    process.stdout.write(
      `[gate ${gate.id} ${gate.name}] ${status} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      if (f.severity === 'info') continue; // summary payload — only useful in --json
      const where = f.file ? ` ${f.file}` : '';
      process.stdout.write(`  - ${f.severity}${where}: ${f.message}\n`);
      if (f.suggestion) {
        process.stdout.write(`      ↳ ${f.suggestion}\n`);
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
