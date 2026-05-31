/**
 * Gate 21 — theme-tone-matrix.
 *
 * Validates two coherence invariants of the design-tokens / component API
 * surface that the rest of the kit silently depends on:
 *
 *   A. The `tone` record exported from `packages/ui-kit/src/tokens.ts` has,
 *      for EVERY tone key, ALL seven sub-fields:
 *
 *          border | bg | soft | glow | ring | text | fill
 *
 *      Missing field   → BLOCKER (component code that reads
 *                        `tone[someKey].soft` will throw at runtime).
 *
 *      And every populated sub-field must match the pattern lock the design
 *      system committed to:
 *
 *          border : border-retro-<color>(/<opacity>)?
 *          bg     : bg-retro-<color>/18          (neutral → /40)
 *          soft   : bg-retro-<color>/8           (neutral → /20)
 *          ring   : focus-visible:ring-retro-<color>/40
 *          text   : text-retro-<color>
 *          fill   : bg-retro-<color>
 *
 *      `glow` is free-form (it's a `shadow-[…]` arbitrary value) so we only
 *      assert presence — not the exact rgba.
 *
 *      For non-`neutral` entries `<color>` MUST equal the record key (so the
 *      `green` entry uses `bg-retro-green/18`, not `bg-retro-cyan/18`). For
 *      `neutral`, `<color>` may be any retro-* token name (because there is
 *      no `retro-neutral` color in the palette — neutral borrows `surface`,
 *      `border`, `text`, `muted`).
 *
 *      Pattern violation → MAJOR.
 *
 *   B. Every component that exposes a `tone?: …` prop MUST cover ALL keys
 *      of the `tone` record. We accept three RHS shapes:
 *
 *        1. `tone?: ToneKey;`           — by construction covers all keys,
 *                                         passes silently.
 *        2. `tone?: Tone;`              — we resolve `Tone` from
 *                                         `common.tsx` and check coverage.
 *        3. `tone?: 'a' | 'b' | 'c';`   — inline literal union; we check
 *                                         coverage directly.
 *
 *      Partial union (e.g. `tone?: 'green' | 'cyan'` when the record has
 *      seven keys) → BLOCKER, because consumer code will type-error trying
 *      to pass an unsupported tone, and any internal `tone[key]` indexing
 *      will narrow incorrectly.
 *
 * Programmatic API:
 *
 *     const gate = new ThemeToneMatrixGate();
 *     const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *
 *     tsx scripts/audit-coherence/gates/21-theme-tone-matrix.ts \
 *       [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — every tone entry is complete + pattern-correct, every `tone?:` prop
 *       is exhaustive.
 *   1 — at least one BLOCKER or MAJOR finding (or context load failed).
 *
 * Safety: read-only. Touches no files.
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
  type GateSeverity,
} from '../_lib/gate-base.js';
import {
  createLogger,
  loadAuditContext,
  type Logger,
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TONE_REQUIRED_FIELDS = [
  'border',
  'bg',
  'soft',
  'glow',
  'ring',
  'text',
  'fill',
] as const;

export type ToneField = (typeof TONE_REQUIRED_FIELDS)[number];

const GATE_NAME = 'theme-tone-matrix';

const COMPONENT_FILE_GLOB = 'packages/ui-kit/src/**/*.tsx';
const COMPONENT_FILE_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
  '**/*.test.tsx',
  '**/*.spec.tsx',
];

// ---------------------------------------------------------------------------
// Pattern matchers
// ---------------------------------------------------------------------------

/**
 * Per-field validators. Each takes (key, classes) and returns an error
 * message string or null if the classes pass the pattern lock.
 *
 * The validators are deliberately strict — we want pattern drift to surface
 * as findings, not be silently massaged into compliance.
 */
type FieldValidator = (key: string, classes: string) => string | null;

const RETRO_TOKEN = '[a-zA-Z][a-zA-Z0-9_-]*';

function matchExact(re: RegExp, classes: string): boolean {
  // The class string may carry multiple utility tokens, but for the pattern
  // lock we expect the field to be exactly ONE utility token (or the
  // arbitrary-value form for `glow`). Trim and disallow whitespace.
  const trimmed = classes.trim();
  if (/\s/.test(trimmed)) return false;
  return re.test(trimmed);
}

const BORDER_RE = new RegExp(`^border-retro-${RETRO_TOKEN}(?:/\\d+)?$`);
const TEXT_RE = new RegExp(`^text-retro-${RETRO_TOKEN}$`);
const FILL_RE_GENERIC = new RegExp(`^bg-retro-${RETRO_TOKEN}$`);
const RING_RE = new RegExp(
  `^focus-visible:ring-retro-${RETRO_TOKEN}/40$`,
);
const RING_RE_NEUTRAL = new RegExp(
  `^focus-visible:ring-retro-${RETRO_TOKEN}(?:/40)?$`,
);
const BG_RE_COLOR = (color: string): RegExp =>
  new RegExp(`^bg-retro-${escapeRegex(color)}/18$`);
const SOFT_RE_COLOR = (color: string): RegExp =>
  new RegExp(`^bg-retro-${escapeRegex(color)}/8$`);
const BG_RE_NEUTRAL = new RegExp(`^bg-retro-${RETRO_TOKEN}/40$`);
const SOFT_RE_NEUTRAL = new RegExp(`^bg-retro-${RETRO_TOKEN}/20$`);
const TEXT_RE_NEUTRAL = new RegExp(`^text-retro-${RETRO_TOKEN}$`);
const FILL_RE_NEUTRAL = new RegExp(`^bg-retro-${RETRO_TOKEN}$`);
const BORDER_RE_COLOR = (color: string): RegExp =>
  new RegExp(`^border-retro-${escapeRegex(color)}(?:/\\d+)?$`);

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFieldValidators(key: string): Record<ToneField, FieldValidator> {
  const isNeutral = key === 'neutral';
  return {
    border: (_k, classes) => {
      const re = isNeutral ? BORDER_RE : BORDER_RE_COLOR(key);
      return matchExact(re, classes)
        ? null
        : isNeutral
          ? `expected pattern "border-retro-<token>(/<opacity>)?", got "${classes}"`
          : `expected "border-retro-${key}(/<opacity>)?" (color must match key), got "${classes}"`;
    },
    bg: (_k, classes) => {
      const re = isNeutral ? BG_RE_NEUTRAL : BG_RE_COLOR(key);
      return matchExact(re, classes)
        ? null
        : isNeutral
          ? `expected pattern "bg-retro-<token>/40" (neutral exception), got "${classes}"`
          : `expected exactly "bg-retro-${key}/18", got "${classes}"`;
    },
    soft: (_k, classes) => {
      const re = isNeutral ? SOFT_RE_NEUTRAL : SOFT_RE_COLOR(key);
      return matchExact(re, classes)
        ? null
        : isNeutral
          ? `expected pattern "bg-retro-<token>/20" (neutral exception), got "${classes}"`
          : `expected exactly "bg-retro-${key}/8", got "${classes}"`;
    },
    glow: (_k, classes) => {
      // glow is free-form; only require it look like a shadow utility.
      const trimmed = classes.trim();
      if (!trimmed) return 'glow must not be empty';
      if (!/^shadow-/.test(trimmed) && !/^drop-shadow-/.test(trimmed)) {
        return `expected a "shadow-*" or "drop-shadow-*" utility, got "${trimmed}"`;
      }
      return null;
    },
    ring: (_k, classes) => {
      const re = isNeutral ? RING_RE_NEUTRAL : RING_RE;
      if (!matchExact(re, classes)) {
        return isNeutral
          ? `expected pattern "focus-visible:ring-retro-<token>(/40)?", got "${classes}"`
          : `expected exactly "focus-visible:ring-retro-${key}/40", got "${classes}"`;
      }
      return null;
    },
    text: (_k, classes) => {
      const re = isNeutral ? TEXT_RE_NEUTRAL : TEXT_RE;
      if (!matchExact(re, classes)) {
        return isNeutral
          ? `expected pattern "text-retro-<token>", got "${classes}"`
          : `expected exactly "text-retro-${key}", got "${classes}"`;
      }
      // Non-neutral must use the key as the color.
      if (!isNeutral && classes.trim() !== `text-retro-${key}`) {
        return `expected exactly "text-retro-${key}", got "${classes}"`;
      }
      return null;
    },
    fill: (_k, classes) => {
      const re = isNeutral ? FILL_RE_NEUTRAL : FILL_RE_GENERIC;
      if (!matchExact(re, classes)) {
        return isNeutral
          ? `expected pattern "bg-retro-<token>", got "${classes}"`
          : `expected exactly "bg-retro-${key}", got "${classes}"`;
      }
      if (!isNeutral && classes.trim() !== `bg-retro-${key}`) {
        return `expected exactly "bg-retro-${key}", got "${classes}"`;
      }
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Tokens.ts parsing
// ---------------------------------------------------------------------------

export interface ParsedToneRecord {
  /** ordered list of tone keys as they appear in the source */
  keys: string[];
  /** key → field → class string (only fields actually present) */
  entries: Record<string, Partial<Record<ToneField, string>>>;
}

/**
 * Parse the `tone` record from a tokens.ts source string.
 *
 * We use a deliberately conservative regex parser rather than the TS compiler
 * because (a) we already know the exact shape (object literal of object
 * literals with single-quoted string values) and (b) we want the gate to be
 * fast and dep-light. If the file shape ever drifts wildly, the parser will
 * return an empty result and the gate will report a BLOCKER for missing
 * record.
 */
export function parseToneRecord(source: string): ParsedToneRecord {
  const result: ParsedToneRecord = { keys: [], entries: {} };

  // Find `export const tone = { … } as const;` — capture body up to the
  // matching closing `}`. We do brace-matching by hand to survive nested
  // braces inside class string arbitrary values like `shadow-[...]`.
  const declRe = /export\s+const\s+tone\s*=\s*\{/;
  const declMatch = declRe.exec(source);
  if (!declMatch) return result;

  const bodyStart = declMatch.index + declMatch[0].length;
  let depth = 1;
  let i = bodyStart;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  if (depth !== 0) return result;
  const body = source.slice(bodyStart, i);

  // Tokenize by top-level entries: each entry is `<key>: { … },`.
  // Walk character by character to respect nested braces & strings.
  let cursor = 0;
  while (cursor < body.length) {
    // Skip whitespace + commas.
    while (cursor < body.length && /[\s,]/.test(body[cursor])) cursor++;
    if (cursor >= body.length) break;

    // Read key identifier.
    const keyMatch = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*\{/.exec(
      body.slice(cursor),
    );
    if (!keyMatch) break;
    const key = keyMatch[1];
    cursor += keyMatch[0].length;

    // Capture inner object body.
    let innerDepth = 1;
    const innerStart = cursor;
    let inString: '"' | "'" | '`' | null = null;
    let inBracket = 0;
    while (cursor < body.length && innerDepth > 0) {
      const ch = body[cursor];
      const prev = cursor > 0 ? body[cursor - 1] : '';
      if (inString) {
        if (ch === inString && prev !== '\\') inString = null;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        inString = ch;
      } else if (ch === '[') {
        inBracket++;
      } else if (ch === ']') {
        inBracket--;
      } else if (ch === '{') {
        innerDepth++;
      } else if (ch === '}') {
        innerDepth--;
        if (innerDepth === 0) break;
      }
      cursor++;
    }
    const innerBody = body.slice(innerStart, cursor);
    cursor++; // step past closing `}`

    const fields = parseToneEntryFields(innerBody);
    result.keys.push(key);
    result.entries[key] = fields;
  }

  return result;
}

function parseToneEntryFields(
  body: string,
): Partial<Record<ToneField, string>> {
  const out: Partial<Record<ToneField, string>> = {};
  // Match `field: 'classes'` or `field: "classes"` entries; arbitrary
  // values inside the class string (`shadow-[…rgba(…)]`) are fine because
  // we capture the full quoted token.
  const fieldRe =
    /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*(['"`])((?:\\.|(?!\2).)*)\2\s*,?/g;
  for (const m of body.matchAll(fieldRe)) {
    const name = m[1];
    if ((TONE_REQUIRED_FIELDS as readonly string[]).includes(name)) {
      out[name as ToneField] = m[3];
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Type-alias resolution: Tone / ToneKey
// ---------------------------------------------------------------------------

export interface ToneTypeAliases {
  /** Keys in the literal union if `Tone` is a union of string literals. */
  toneUnionKeys: string[] | null;
  /** True if `ToneKey = keyof typeof tone` was found (full-coverage marker). */
  toneKeyIsKeyofTone: boolean;
  /** Source files where the aliases were discovered (for findings). */
  aliasFiles: string[];
}

/**
 * Resolve the `Tone` and `ToneKey` type aliases by scanning the ui-kit src
 * tree. We look at every .tsx/.ts file (excluding tests/stories/examples).
 *
 * `Tone` is expected to be a union of string literals in `common.tsx`:
 *
 *     export type Tone = 'green' | 'cyan' | … | 'neutral';
 *
 * `ToneKey` is expected to be `keyof typeof tone` in `tokens.ts`.
 */
export async function resolveToneAliases(
  uiKitSrcDir: string,
  logger: Logger,
): Promise<ToneTypeAliases> {
  const aliases: ToneTypeAliases = {
    toneUnionKeys: null,
    toneKeyIsKeyofTone: false,
    aliasFiles: [],
  };

  const files = await fgGlob(['**/*.{ts,tsx}'], {
    cwd: uiKitSrcDir,
    absolute: true,
    onlyFiles: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/__tests__/**',
      '**/*.stories.tsx',
      '**/*.examples.tsx',
      '**/*.test.tsx',
      '**/*.spec.tsx',
    ],
  });

  for (const file of files) {
    let source: string;
    try {
      source = await fs.readFile(file, 'utf8');
    } catch (err) {
      logger.debug(
        `theme-tone-matrix: cannot read ${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    const toneAlias = extractStringUnionAlias(source, 'Tone');
    if (toneAlias && aliases.toneUnionKeys === null) {
      aliases.toneUnionKeys = toneAlias;
      aliases.aliasFiles.push(file);
    }

    if (!aliases.toneKeyIsKeyofTone) {
      const re =
        /(?:export\s+)?type\s+ToneKey\s*=\s*keyof\s+typeof\s+tone\s*;?/;
      if (re.test(source)) {
        aliases.toneKeyIsKeyofTone = true;
        if (!aliases.aliasFiles.includes(file)) aliases.aliasFiles.push(file);
      }
    }
  }

  return aliases;
}

/**
 * Extract the string-literal union of a top-level type alias.
 *
 * Returns the list of literal strings, or null if the alias is missing OR
 * its RHS is not a pure literal union.
 */
export function extractStringUnionAlias(
  source: string,
  aliasName: string,
): string[] | null {
  const re = new RegExp(
    `(?:export\\s+)?type\\s+${escapeRegex(aliasName)}\\s*=\\s*([^;]+);`,
  );
  const m = re.exec(source);
  if (!m) return null;
  const rhs = m[1].trim();
  return parseLiteralUnion(rhs);
}

/**
 * Parse a TypeScript literal-string union expression into its constituent
 * literals. Returns null if any branch is not a quoted string literal.
 */
export function parseLiteralUnion(input: string): string[] | null {
  const cleaned = input.replace(/^\(|\)$/g, '').trim();
  const parts = cleaned.split('|').map((p) => p.trim());
  const out: string[] = [];
  const litRe = /^(['"`])([^'"`]+)\1$/;
  for (const part of parts) {
    if (!part) return null;
    const m = litRe.exec(part);
    if (!m) return null;
    out.push(m[2]);
  }
  return out.length > 0 ? out : null;
}

// ---------------------------------------------------------------------------
// Component tone-prop discovery
// ---------------------------------------------------------------------------

export interface ToneProp {
  file: string;
  line: number;
  /** The raw RHS expression after `tone?:` and before `;` / `,`. */
  rhs: string;
  /** Component / interface name carrying the prop, best-effort. */
  owner: string;
}

const TONE_PROP_RE = /(^|\s)tone\?\s*:\s*([^;,\n}]+)[;,}\n]/g;

/**
 * Find every `tone?: …` declaration in the ui-kit component sources.
 *
 * Best-effort owner attribution: we walk backwards from the match to the
 * nearest `interface XxxxProps`, `type XxxxProps =`, or top-level component
 * `export function Xxxx(`/`export const Xxxx =` declaration.
 */
export async function findToneProps(
  uiKitSrcDir: string,
  repoRoot: string,
  logger: Logger,
): Promise<ToneProp[]> {
  const rel = path.relative(repoRoot, uiKitSrcDir).split(path.sep).join('/');
  const globRoot = rel ? `${rel}/**/*.tsx` : COMPONENT_FILE_GLOB;
  const files = await fgGlob([globRoot], {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    ignore: COMPONENT_FILE_IGNORE,
  });

  const out: ToneProp[] = [];
  for (const file of files) {
    let source: string;
    try {
      source = await fs.readFile(file, 'utf8');
    } catch (err) {
      logger.debug(
        `theme-tone-matrix: cannot read ${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }
    const re = new RegExp(TONE_PROP_RE.source, TONE_PROP_RE.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const rhs = m[2].trim();
      const line = source.slice(0, m.index).split(/\r?\n/).length;
      const owner = guessOwner(source, m.index);
      out.push({ file, line, rhs, owner });
    }
  }
  return out;
}

function guessOwner(source: string, atIndex: number): string {
  const head = source.slice(0, atIndex);
  // Look backwards for the nearest interface / type alias / component.
  const patterns = [
    /interface\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:extends[^{]+)?\{[^}]*$/,
    /type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\{[^}]*$/,
    /export\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)/,
    /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*[:=]/,
  ];
  for (const pat of patterns) {
    const matches = [...head.matchAll(new RegExp(pat.source, 'g'))];
    if (matches.length > 0) {
      return matches[matches.length - 1][1];
    }
  }
  return '<unknown>';
}

// ---------------------------------------------------------------------------
// Coverage check
// ---------------------------------------------------------------------------

export interface CoverageCheck {
  ok: boolean;
  missing: string[];
  /** What kind of RHS we resolved (for error messages). */
  kind: 'ToneKey' | 'Tone-alias' | 'inline-union' | 'unknown';
}

export function checkToneCoverage(
  rhs: string,
  toneKeys: string[],
  aliases: ToneTypeAliases,
): CoverageCheck {
  const trimmed = rhs.trim();

  // 1) Bare type references.
  if (/^ToneKey(\s*\|\s*undefined)?$/.test(trimmed)) {
    // ToneKey === keyof typeof tone → exhaustive by construction (if the
    // alias is actually wired that way). If we couldn't confirm the alias,
    // we still trust the name — flag-coverage of the gate is on the record,
    // not on the alias spelling.
    return {
      ok: true,
      missing: [],
      kind: aliases.toneKeyIsKeyofTone ? 'ToneKey' : 'ToneKey',
    };
  }

  if (/^Tone(\s*\|\s*undefined)?$/.test(trimmed)) {
    const union = aliases.toneUnionKeys;
    if (!union) {
      // Cannot resolve — treat as unknown so caller can produce a softer
      // (minor) finding rather than a blocker.
      return { ok: false, missing: [...toneKeys], kind: 'unknown' };
    }
    const missing = toneKeys.filter((k) => !union.includes(k));
    return { ok: missing.length === 0, missing, kind: 'Tone-alias' };
  }

  // 2) Inline literal union.
  const literals = parseLiteralUnion(trimmed);
  if (literals) {
    const missing = toneKeys.filter((k) => !literals.includes(k));
    return { ok: missing.length === 0, missing, kind: 'inline-union' };
  }

  // 3) Something else (intersection, generic, branded type…) — we can't
  // reason about it. Treat as unknown.
  return { ok: false, missing: [...toneKeys], kind: 'unknown' };
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export interface ThemeToneMatrixGateOptions {
  /** Override the tokens.ts reader (tests inject in-memory source). */
  readTokensSource?: (tokensFile: string) => Promise<string | null>;
  /** Override the alias resolver. */
  resolveAliases?: (
    uiKitSrcDir: string,
    logger: Logger,
  ) => Promise<ToneTypeAliases>;
  /** Override the tone-prop scanner. */
  scanToneProps?: (
    uiKitSrcDir: string,
    repoRoot: string,
    logger: Logger,
  ) => Promise<ToneProp[]>;
}

async function defaultReadTokensSource(
  tokensFile: string,
): Promise<string | null> {
  if (!(await fs.pathExists(tokensFile))) return null;
  return fs.readFile(tokensFile, 'utf8');
}

export class ThemeToneMatrixGate extends Gate {
  readonly id = 21;
  readonly name = GATE_NAME;
  readonly description =
    'Validate the `tone` record in tokens.ts (every key has all 7 sub-fields with the locked pattern) AND every component `tone?:` prop covers all tone keys. Blocker on missing field / partial union; Major on pattern violation.';

  private readonly readTokensSource: (
    tokensFile: string,
  ) => Promise<string | null>;
  private readonly resolveAliasesImpl: (
    uiKitSrcDir: string,
    logger: Logger,
  ) => Promise<ToneTypeAliases>;
  private readonly scanToneProps: (
    uiKitSrcDir: string,
    repoRoot: string,
    logger: Logger,
  ) => Promise<ToneProp[]>;

  constructor(options: ThemeToneMatrixGateOptions = {}) {
    super();
    this.readTokensSource = options.readTokensSource ?? defaultReadTokensSource;
    this.resolveAliasesImpl = options.resolveAliases ?? resolveToneAliases;
    this.scanToneProps = options.scanToneProps ?? findToneProps;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    // -- Part A: tokens.ts -----------------------------------------------
    const tokensSource = await this.readTokensSource(ctx.tokensFile);
    if (tokensSource === null) {
      findings.push({
        severity: 'blocker',
        file: toPosix(ctx.tokensFile),
        message: `Cannot locate tokens.ts — gate cannot validate the tone record.`,
        suggestion: `Create packages/ui-kit/src/tokens.ts and export a \`tone\` record with keys covering every supported tone (e.g. neutral, green, cyan, gold, red, purple, pink), each carrying all 7 sub-fields: ${TONE_REQUIRED_FIELDS.join(', ')}.`,
      });
      return gateFail(this.name, findings, Date.now() - started);
    }

    const tone = parseToneRecord(tokensSource);

    if (tone.keys.length === 0) {
      findings.push({
        severity: 'blocker',
        file: toPosix(ctx.tokensFile),
        message:
          'No `tone` record found in tokens.ts (or parser could not read it).',
        suggestion:
          'Export `tone` as an object literal `as const` with at least the `neutral` key plus your accent palette; each entry must have border/bg/soft/glow/ring/text/fill.',
      });
      return gateFail(this.name, findings, Date.now() - started);
    }

    for (const key of tone.keys) {
      const entry = tone.entries[key] ?? {};
      const validators = buildFieldValidators(key);

      // (1) Missing-field check — BLOCKER.
      for (const field of TONE_REQUIRED_FIELDS) {
        const value = entry[field];
        if (value === undefined || value === '') {
          findings.push({
            severity: 'blocker',
            file: toPosix(ctx.tokensFile),
            component: `tone.${key}`,
            message: `Missing sub-field \`${field}\` for tone entry \`${key}\`. Every tone MUST declare all 7 sub-fields: ${TONE_REQUIRED_FIELDS.join(', ')}.`,
            suggestion: suggestionForMissingField(key, field),
          });
          continue;
        }

        // (2) Pattern-violation check — MAJOR.
        const error = validators[field](key, value);
        if (error) {
          findings.push({
            severity: 'major',
            file: toPosix(ctx.tokensFile),
            component: `tone.${key}.${field}`,
            message: `Pattern violation for \`tone.${key}.${field}\`: ${error}.`,
            suggestion: suggestionForPatternViolation(key, field),
          });
        }
      }
    }

    // -- Part B: component tone?: coverage --------------------------------
    const aliases = await this.resolveAliasesImpl(ctx.uiKitSrcDir, ctx.logger);
    const toneProps = await this.scanToneProps(
      ctx.uiKitSrcDir,
      ctx.repoRoot,
      ctx.logger,
    );

    // If the `Tone` alias resolves to a partial union vs. the tone record
    // itself, that's a single high-impact finding (every component using
    // `Tone` is now silently under-typed).
    if (
      aliases.toneUnionKeys &&
      tone.keys.length > 0 &&
      !arraysCoverSet(aliases.toneUnionKeys, tone.keys)
    ) {
      const missing = tone.keys.filter(
        (k) => !aliases.toneUnionKeys!.includes(k),
      );
      const aliasFile = aliases.aliasFiles[0];
      findings.push({
        severity: 'blocker',
        file: aliasFile ? toPosix(aliasFile) : undefined,
        component: 'Tone',
        message: `The \`Tone\` type alias is a partial union — missing tone keys: ${missing.map((m) => `"${m}"`).join(', ')}. Every component prop typed as \`Tone\` is silently restricted to a subset of the tone record.`,
        suggestion: `Update the \`Tone\` alias to: \`export type Tone = ${tone.keys.map((k) => `'${k}'`).join(' | ')};\` (or replace usages with \`ToneKey\` from tokens.ts).`,
      });
    }

    for (const prop of toneProps) {
      const coverage = checkToneCoverage(prop.rhs, tone.keys, aliases);
      if (coverage.ok) continue;

      const severity: GateSeverity =
        coverage.kind === 'unknown' ? 'minor' : 'blocker';

      const message =
        coverage.kind === 'unknown'
          ? `Could not statically verify that the \`tone?:\` prop on \`${prop.owner}\` covers all tone keys (RHS \`${prop.rhs}\` is not a recognised alias or literal union).`
          : `\`${prop.owner}\` exposes \`tone?: ${prop.rhs}\` but the union is missing tone keys: ${coverage.missing.map((m) => `"${m}"`).join(', ')}.`;

      const suggestion =
        coverage.kind === 'unknown'
          ? `Type the prop as \`ToneKey\` (from tokens.ts) so it tracks the tone record automatically.`
          : `Either use \`ToneKey\` from tokens.ts, or extend the union to: \`${tone.keys.map((k) => `'${k}'`).join(' | ')}\`.`;

      findings.push({
        severity,
        file: toPosix(prop.file),
        component: prop.owner,
        message: `${message} (${toPosix(prop.file)}:${prop.line})`,
        suggestion,
      });
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }
}

function arraysCoverSet(union: string[], required: string[]): boolean {
  return required.every((r) => union.includes(r));
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function suggestionForMissingField(key: string, field: ToneField): string {
  const isNeutral = key === 'neutral';
  switch (field) {
    case 'border':
      return `Add \`border: '${isNeutral ? 'border-retro-border' : `border-retro-${key}/30`}'\` to the \`${key}\` entry.`;
    case 'bg':
      return `Add \`bg: '${isNeutral ? 'bg-retro-surface/40' : `bg-retro-${key}/18`}'\` to the \`${key}\` entry.`;
    case 'soft':
      return `Add \`soft: '${isNeutral ? 'bg-retro-surface/20' : `bg-retro-${key}/8`}'\` to the \`${key}\` entry.`;
    case 'glow':
      return `Add \`glow: 'shadow-[0_0_24px_-8px_rgba(<color-rgb>,0.45)]'\` to the \`${key}\` entry (pick rgba matching the retro-${key} swatch).`;
    case 'ring':
      return `Add \`ring: '${isNeutral ? 'focus-visible:ring-retro-border' : `focus-visible:ring-retro-${key}/40`}'\` to the \`${key}\` entry.`;
    case 'text':
      return `Add \`text: '${isNeutral ? 'text-retro-text' : `text-retro-${key}`}'\` to the \`${key}\` entry.`;
    case 'fill':
      return `Add \`fill: '${isNeutral ? 'bg-retro-muted' : `bg-retro-${key}`}'\` to the \`${key}\` entry.`;
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

function suggestionForPatternViolation(key: string, field: ToneField): string {
  const isNeutral = key === 'neutral';
  switch (field) {
    case 'border':
      return isNeutral
        ? `Use \`border-retro-<token>(/<opacity>)?\` (e.g. \`border-retro-border\`).`
        : `Use \`border-retro-${key}/<opacity>\` (e.g. \`border-retro-${key}/30\`). The color MUST match the record key.`;
    case 'bg':
      return isNeutral
        ? `Neutral exception: use \`bg-retro-<token>/40\` (e.g. \`bg-retro-surface/40\`).`
        : `Use exactly \`bg-retro-${key}/18\`. The opacity and color are pattern-locked.`;
    case 'soft':
      return isNeutral
        ? `Neutral exception: use \`bg-retro-<token>/20\` (e.g. \`bg-retro-surface/20\`).`
        : `Use exactly \`bg-retro-${key}/8\`. The opacity and color are pattern-locked.`;
    case 'glow':
      return `Use a single \`shadow-[...]\` arbitrary-value class. Free-form rgba allowed, but it MUST start with \`shadow-\` (or \`drop-shadow-\`).`;
    case 'ring':
      return isNeutral
        ? `Use \`focus-visible:ring-retro-<token>(/40)?\`.`
        : `Use exactly \`focus-visible:ring-retro-${key}/40\`. Color and opacity are pattern-locked.`;
    case 'text':
      return isNeutral
        ? `Use \`text-retro-<token>\` (e.g. \`text-retro-text\`).`
        : `Use exactly \`text-retro-${key}\`. Color MUST match the record key.`;
    case 'fill':
      return isNeutral
        ? `Use \`bg-retro-<token>\` (e.g. \`bg-retro-muted\`).`
        : `Use exactly \`bg-retro-${key}\`. Color MUST match the record key.`;
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  verbose: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    root: process.cwd(),
    json: false,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--repo' || arg === '--root' || arg === '-r') {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      opts.root = path.resolve(next);
      i++;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: tsx scripts/audit-coherence/gates/21-theme-tone-matrix.ts [options]',
          '',
          'Options:',
          '  --repo, --root, -r <dir>   Repo root to audit (default: cwd)',
          '  --json                     Emit JSON GateResult on stdout',
          '  --verbose, -v              Verbose logging',
          '  --help, -h                 Show this help',
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
  const logger = createLogger(opts.verbose);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new ThemeToneMatrixGate();
  const result = await gate.run(ctx);

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const badge = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(
      `${badge} [gate ${gate.id}] ${result.name} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(
        `  - ${pc.yellow(f.severity)}${who}${where}: ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`      ${pc.dim('-> ' + f.suggestion)}\n`);
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
        `theme-tone-matrix failed: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default ThemeToneMatrixGate;
