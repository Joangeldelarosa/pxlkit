/**
 * Gate 28 — a11y-pattern-declared.
 *
 * Coherence rail (deeper than core gates):
 *   Every interactive component MUST declare its accessibility pattern(s) in
 *   its manifest under `a11y.patterns`, AND the declared pattern(s) MUST
 *   match the `role=` attributes the component actually renders.
 *
 * Why MAJOR (not blocker, not minor):
 *   A wrong/missing a11y.patterns declaration silently mis-documents the
 *   component to consumers (and to assistive tech generators) without
 *   breaking the build. It is a coherence regression — the manifest says
 *   "button", the impl renders `role="combobox"`. Either the manifest is
 *   stale, or the impl is wrong. Either way the user is being lied to.
 *
 * Rule, precisely:
 *
 *   (R1) If a manifest looks interactive — either it sets `interactive: true`
 *        or its `component` name lexically suggests an interactive widget
 *        (Button, Combobox, Menu, Tablist, Dialog, …) — then `a11y.patterns`
 *        MUST be a non-empty array of strings.
 *
 *   (R2) Every value inside `a11y.patterns` MUST be one of the known WAI-ARIA
 *        widget pattern tokens we maintain at the head of this file. Unknown
 *        tokens are MAJOR — typos like `'cobobox'` are exactly the kind of
 *        silent rot this gate exists to catch.
 *
 *   (R3) When we can resolve a component impl file (manifest.file, or
 *        inferred from `component` name), we read it and harvest every
 *        `role="…"` attribute it declares. Declared patterns and discovered
 *        roles MUST overlap. The canonical example is a Combobox whose
 *        manifest declares `a11y.patterns: ['button']` — the role-grep finds
 *        `role="combobox"`, the manifest does not, that is a MAJOR mismatch.
 *
 * Non-interactive manifests are skipped entirely (R1 doesn't fire), so a
 * `PixelBox` layout primitive with no a11y block isn't penalised. Likewise a
 * manifest that opts out via `interactive: false` is skipped — it is the
 * author's explicit assertion that the component is presentational.
 *
 * Programmatic API:
 *   const gate = new A11yPatternDeclaredGate();
 *   const result = await gate.run(ctx);
 *
 * CLI:
 *   tsx scripts/audit-coherence/gates/28-a11y-pattern-declared.ts \
 *     [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes: 0 if every interactive manifest is coherent, 1 otherwise.
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

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
// Pattern vocabulary
// ---------------------------------------------------------------------------

/**
 * Canonical WAI-ARIA widget pattern tokens we accept inside
 * `manifest.a11y.patterns`. This list intentionally tracks the ARIA Authoring
 * Practices Guide widget patterns plus the implicit roles for common HTML
 * controls. We accept lowercase tokens only — manifests should normalise.
 *
 * If you need a new pattern, add it here AND add it to the role-derivation
 * table below so the cross-reference still resolves.
 */
export const KNOWN_PATTERNS: ReadonlySet<string> = new Set([
  'alert',
  'alertdialog',
  'button',
  'checkbox',
  'combobox',
  'dialog',
  'disclosure',
  'feed',
  'grid',
  'gridcell',
  'group',
  'link',
  'listbox',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'progressbar',
  'radio',
  'radiogroup',
  'scrollbar',
  'searchbox',
  'separator',
  'slider',
  'spinbutton',
  'status',
  'switch',
  'tab',
  'table',
  'tablist',
  'tabpanel',
  'textbox',
  'toolbar',
  'tooltip',
  'tree',
  'treegrid',
  'treeitem',
]);

/**
 * Component-name → pattern bias. Used by R1 to decide a manifest is
 * "interactive" when the author hasn't explicitly opted in via
 * `interactive: true`. The patterns here aren't authoritative for matching —
 * they're just the trigger that says "you must declare something".
 *
 * Lowercase, prefix-stripped tokens (e.g. `combobox` matches `PixelCombobox`,
 * `CmdCombobox`, `combobox`, etc.). Kept short — false positives are cheaper
 * than false negatives for this rule.
 */
export const INTERACTIVE_NAME_HINTS: ReadonlyArray<string> = [
  'button',
  'checkbox',
  'combobox',
  'dialog',
  'disclosure',
  'dropdown',
  'grid',
  'link',
  'listbox',
  'menu',
  'menubar',
  'modal',
  'option',
  'popover',
  'radio',
  'searchbox',
  'select',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'tablist',
  'tabpanel',
  'textbox',
  'textfield',
  'toggle',
  'toolbar',
  'tooltip',
  'tree',
];

// ---------------------------------------------------------------------------
// Manifest shape (loose — manifests are Zod-passthrough)
// ---------------------------------------------------------------------------

interface ManifestLike {
  component?: unknown;
  file?: unknown;
  source?: unknown;
  interactive?: unknown;
  a11y?: unknown;
  [key: string]: unknown;
}

interface A11yLike {
  patterns?: unknown;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asA11y(value: unknown): A11yLike | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') return null;
  return value as A11yLike;
}

/**
 * Lowercase, alphanumeric-only stem of a component name. `PixelComboBox` →
 * `pixelcombobox`. Used for hint detection.
 */
export function normaliseComponentName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * R1 trigger: does this manifest's component name imply an interactive
 * widget? Returns the matched hint token (so the diagnostic can quote it),
 * or null when the name looks presentational.
 *
 * Matching prefers the LONGEST hint that appears in the normalised name so
 * `PixelTablist` resolves to `tablist`, not `tab`. The hints array stays in
 * documentation order; sort happens at match time.
 */
export function inferInteractiveFromName(componentName: string): string | null {
  const norm = normaliseComponentName(componentName);
  const byLength = [...INTERACTIVE_NAME_HINTS].sort((a, b) => b.length - a.length);
  for (const hint of byLength) {
    if (norm.includes(hint)) return hint;
  }
  return null;
}

export interface InteractivityDecision {
  interactive: boolean;
  /** Why we decided this manifest is interactive — for finding messages. */
  reason: 'explicit-true' | 'name-hint' | 'explicit-false' | 'no-signal';
  /** When reason === 'name-hint', the hint that matched. */
  hint?: string;
}

export function decideInteractivity(manifest: ManifestLike): InteractivityDecision {
  if (manifest.interactive === false) {
    return { interactive: false, reason: 'explicit-false' };
  }
  if (manifest.interactive === true) {
    return { interactive: true, reason: 'explicit-true' };
  }
  const componentName = asString(manifest.component);
  if (componentName) {
    const hint = inferInteractiveFromName(componentName);
    if (hint) return { interactive: true, reason: 'name-hint', hint };
  }
  return { interactive: false, reason: 'no-signal' };
}

// ---------------------------------------------------------------------------
// a11y.patterns validation
// ---------------------------------------------------------------------------

export type PatternsViolation =
  | { kind: 'missing-a11y-block' }
  | { kind: 'missing-patterns' }
  | { kind: 'empty-patterns' }
  | { kind: 'not-array'; value: string }
  | { kind: 'non-string-entry'; index: number; value: string }
  | { kind: 'unknown-pattern'; index: number; value: string };

/**
 * Validate the declared `a11y.patterns` shape. Returns an array of
 * structural violations (a manifest with three typo'd patterns produces
 * three `unknown-pattern` violations). Empty array = the declaration itself
 * is well-formed.
 */
export function validatePatternsShape(manifest: ManifestLike): PatternsViolation[] {
  const a11y = asA11y(manifest.a11y);
  if (!a11y) return [{ kind: 'missing-a11y-block' }];
  const raw = a11y.patterns;
  if (raw === undefined || raw === null) return [{ kind: 'missing-patterns' }];
  if (!Array.isArray(raw)) {
    return [{ kind: 'not-array', value: describeValue(raw) }];
  }
  if (raw.length === 0) return [{ kind: 'empty-patterns' }];

  const out: PatternsViolation[] = [];
  raw.forEach((entry, index) => {
    if (typeof entry !== 'string' || entry.length === 0) {
      out.push({ kind: 'non-string-entry', index, value: describeValue(entry) });
      return;
    }
    if (!KNOWN_PATTERNS.has(entry)) {
      out.push({ kind: 'unknown-pattern', index, value: entry });
    }
  });
  return out;
}

/**
 * Returns the declared patterns as a normalised lowercase set, dropping any
 * malformed entries. Safe to use even when validatePatternsShape produced
 * violations — we want partial cross-reference where possible.
 */
export function declaredPatternSet(manifest: ManifestLike): Set<string> {
  const a11y = asA11y(manifest.a11y);
  if (!a11y || !Array.isArray(a11y.patterns)) return new Set();
  const out = new Set<string>();
  for (const entry of a11y.patterns) {
    if (typeof entry === 'string' && entry.length > 0) {
      out.add(entry.toLowerCase());
    }
  }
  return out;
}

function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  const t = typeof value;
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number' || t === 'boolean') return String(value);
  if (Array.isArray(value)) return `array(${value.length})`;
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

// ---------------------------------------------------------------------------
// Impl file resolution + role harvesting
// ---------------------------------------------------------------------------

/**
 * Match `role="combobox"`, `role={'combobox'}`, `role={"combobox"}`, and
 * `role={`combobox`}`. We deliberately accept template-string literals with
 * no interpolation — `role={`button`}` is fine, `role={`${kind}`}` is not.
 *
 * Group 1: quote/backtick. Group 2: role token.
 */
const ROLE_ATTR_RE = /\brole\s*=\s*(?:\{?\s*(['"`])([a-z][a-z0-9-]*)\1\s*\}?)/gi;

/**
 * Harvest the set of static `role="…"` attribute values from a source file.
 * Dynamic roles (`role={kind}`) are intentionally ignored — the gate only
 * cares about what the impl unconditionally promises to render.
 */
export function harvestRolesFromSource(source: string): Set<string> {
  const out = new Set<string>();
  ROLE_ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ROLE_ATTR_RE.exec(source)) !== null) {
    const role = (m[2] ?? '').toLowerCase();
    if (role.length > 0) out.add(role);
  }
  return out;
}

/**
 * Resolve the absolute on-disk path of a component impl, given:
 *   - the AuditContext (for repoRoot + uiKitSrcDir),
 *   - the manifest (manifest.file is preferred when present),
 *   - the component name (used as a fallback walk under ui-kit/src).
 *
 * Returns null when no candidate file resolves. The gate degrades
 * gracefully: if we can't find the impl, we skip cross-reference (R3) but
 * still enforce structural R1/R2.
 */
export interface ResolveImplFileDeps {
  pathExists: (p: string) => Promise<boolean>;
}

export async function resolveImplFile(
  manifest: ManifestLike,
  ctx: AuditContext,
  deps: ResolveImplFileDeps,
): Promise<string | null> {
  const explicitFile = asString(manifest.file);
  if (explicitFile) {
    const candidates = [
      explicitFile,
      path.isAbsolute(explicitFile) ? explicitFile : path.join(ctx.repoRoot, explicitFile),
    ];
    for (const candidate of candidates) {
      if (await deps.pathExists(candidate)) return candidate;
    }
  }

  const componentName = asString(manifest.component);
  if (!componentName) return null;

  // Fallback: probe ui-kit src for a same-named .tsx file. Doesn't scan
  // every directory (fast-glob would be heavier than necessary here); we
  // try the obvious "src/<Name>.tsx" + first-level subdirs.
  const probes = [
    path.join(ctx.uiKitSrcDir, `${componentName}.tsx`),
    path.join(ctx.uiKitSrcDir, `${componentName}.ts`),
  ];
  for (const probe of probes) {
    if (await deps.pathExists(probe)) return probe;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Cross-reference (R3)
// ---------------------------------------------------------------------------

export interface CrossReferenceMismatch {
  /** Roles in the impl that the manifest does not declare. */
  rolesNotDeclared: string[];
  /** Patterns declared that don't appear in the impl. */
  patternsNotInImpl: string[];
}

export function compareDeclaredVsRoles(
  declared: Set<string>,
  roles: Set<string>,
): CrossReferenceMismatch | null {
  const rolesNotDeclared = [...roles].filter((r) => !declared.has(r)).sort();
  const patternsNotInImpl = [...declared].filter((p) => !roles.has(p)).sort();
  if (rolesNotDeclared.length === 0 && patternsNotInImpl.length === 0) return null;
  return { rolesNotDeclared, patternsNotInImpl };
}

// ---------------------------------------------------------------------------
// Finding shaping
// ---------------------------------------------------------------------------

interface FindingCtx {
  componentName: string;
  source?: string;
}

function shapeViolationFinding(
  v: PatternsViolation,
  ctx: FindingCtx,
): GateFinding {
  switch (v.kind) {
    case 'missing-a11y-block':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" has no \`a11y\` block in its manifest — cannot determine ARIA pattern.`,
        suggestion: `Add \`a11y: { patterns: ['<pattern>'] }\` to the manifest. Allowed tokens: ${[...KNOWN_PATTERNS].slice(0, 8).join(', ')}, … (full list in gate 28 source).`,
      };
    case 'missing-patterns':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" has an \`a11y\` block but no \`patterns\` field — every interactive component MUST declare its ARIA pattern(s).`,
        suggestion: `Set \`a11y.patterns\` to an array of pattern tokens, e.g. \`['button']\` for a button widget, \`['combobox', 'listbox']\` for a combobox.`,
      };
    case 'empty-patterns':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" declares \`a11y.patterns: []\` — an empty array is the same as having no declaration.`,
        suggestion: `Populate the array with at least one valid pattern token. If the component is presentational (no role), set \`interactive: false\` instead.`,
      };
    case 'not-array':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" declares \`a11y.patterns\` as ${v.value} — expected an array of strings.`,
        suggestion: `Change \`a11y.patterns\` to an array literal: \`a11y: { patterns: ['button'] }\`.`,
      };
    case 'non-string-entry':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" has a non-string entry at \`a11y.patterns[${v.index}]\` (got ${v.value}).`,
        suggestion: `Each entry in \`a11y.patterns\` must be a lowercase string token, e.g. 'button', 'combobox', 'menu'.`,
      };
    case 'unknown-pattern':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.componentName,
        message: `Interactive component "${ctx.componentName}" declares unknown pattern "${v.value}" at \`a11y.patterns[${v.index}]\`.`,
        suggestion: `Replace "${v.value}" with a known WAI-ARIA pattern token. Closest matches: ${suggestNearestPatterns(v.value).join(', ') || '(none — check the ARIA APG)'}.`,
      };
    default: {
      const _exhaustive: never = v;
      return _exhaustive;
    }
  }
}

/**
 * Cheap edit-distance heuristic for the "did you mean?" suggestion. We don't
 * need a full Levenshtein implementation — a substring + length check is
 * enough to surface `combobox` when the user typed `cobobox`.
 */
function suggestNearestPatterns(typo: string, max = 3): string[] {
  const lowered = typo.toLowerCase();
  const scored: Array<{ token: string; score: number }> = [];
  for (const token of KNOWN_PATTERNS) {
    const score = similarityScore(lowered, token);
    if (score > 0) scored.push({ token, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((s) => s.token);
}

function similarityScore(a: string, b: string): number {
  if (a === b) return 100;
  if (a.length === 0 || b.length === 0) return 0;
  // Substring containment is a strong signal.
  if (b.includes(a) || a.includes(b)) return 50 + Math.min(a.length, b.length);
  // Shared character bag — cheap approximation of "looks similar".
  const bag = new Set(b);
  let hits = 0;
  for (const ch of a) if (bag.has(ch)) hits += 1;
  const lengthPenalty = Math.abs(a.length - b.length);
  return hits - lengthPenalty;
}

function shapeMismatchFinding(
  mismatch: CrossReferenceMismatch,
  ctx: FindingCtx & { implFile: string; declared: string[]; rolesInImpl: string[] },
): GateFinding {
  const parts: string[] = [];
  if (mismatch.rolesNotDeclared.length > 0) {
    parts.push(
      `impl renders role(s) [${mismatch.rolesNotDeclared.join(', ')}] not declared in manifest`,
    );
  }
  if (mismatch.patternsNotInImpl.length > 0) {
    parts.push(
      `manifest declares pattern(s) [${mismatch.patternsNotInImpl.join(', ')}] with no matching role in impl`,
    );
  }
  // Build an actionable suggestion: prefer realigning the manifest to what
  // the impl actually does, since the impl is source of truth for runtime
  // behaviour.
  const suggestedPatterns = ctx.rolesInImpl.length > 0
    ? `[${ctx.rolesInImpl.map((r) => `'${r}'`).join(', ')}]`
    : `(no static role found — declare the WAI-ARIA pattern the component implements and add a matching \`role\` attribute)`;
  const suggestion = `Either (a) align the manifest with the impl by setting \`a11y.patterns: ${suggestedPatterns}\`, or (b) fix the impl so its static \`role="…"\` attributes match the declared pattern(s) [${ctx.declared.join(', ') || '<none>'}].`;
  return {
    severity: 'major',
    file: ctx.implFile,
    component: ctx.componentName,
    message: `Interactive component "${ctx.componentName}" — a11y.patterns / impl role mismatch: ${parts.join('; ')}.`,
    suggestion,
  };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export interface A11yPatternDeclaredGateOptions {
  /**
   * Override file reader (used by tests). Default uses fs-extra. Returning
   * null is treated as "file does not exist".
   */
  readFile?: (absPath: string) => Promise<string | null>;
  /**
   * Override exists probe (used by tests + resolveImplFile). Default uses
   * fs-extra.
   */
  pathExists?: (absPath: string) => Promise<boolean>;
}

export class A11yPatternDeclaredGate extends Gate {
  readonly id = 28;
  readonly name = 'a11y-pattern-declared';
  readonly description =
    'Every interactive component MUST declare its a11y.patterns in manifest, and the declared patterns MUST match the static role= attributes harvested from the impl. Major on violation.';

  private readonly readFileImpl: (absPath: string) => Promise<string | null>;
  private readonly pathExistsImpl: (absPath: string) => Promise<boolean>;

  constructor(options: A11yPatternDeclaredGateOptions = {}) {
    super();
    this.readFileImpl = options.readFile ?? defaultReadFile;
    this.pathExistsImpl = options.pathExists ?? defaultPathExists;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as ManifestLike[];

    for (const manifest of manifests) {
      const componentName = asString(manifest.component) ?? '<unknown>';
      const source = asString(manifest.source) ?? undefined;

      const decision = decideInteractivity(manifest);
      if (!decision.interactive) {
        ctx.logger.debug(
          `a11y-pattern-declared: ${componentName} skipped (${decision.reason})`,
        );
        continue;
      }

      // R1 + R2 — structural validation of a11y.patterns.
      const violations = validatePatternsShape(manifest);
      for (const v of violations) {
        findings.push(shapeViolationFinding(v, { componentName, source }));
      }

      // R3 — cross-reference with impl roles. We attempt this even when R1/R2
      // produced findings, because the cross-reference often gives the user
      // the concrete role they should be declaring.
      const implFile = await resolveImplFile(manifest, ctx, {
        pathExists: this.pathExistsImpl,
      });
      if (!implFile) {
        ctx.logger.debug(
          `a11y-pattern-declared: ${componentName} — no impl file resolved, skipping role cross-ref`,
        );
        continue;
      }

      let implSource: string | null;
      try {
        implSource = await this.readFileImpl(implFile);
      } catch (err) {
        findings.push({
          severity: 'major',
          file: implFile,
          component: componentName,
          message: `Failed to read impl file for "${componentName}": ${describeError(err)}`,
          suggestion: 'Ensure the impl file is readable so role= cross-reference can run.',
        });
        continue;
      }
      if (implSource === null) {
        ctx.logger.debug(
          `a11y-pattern-declared: ${componentName} — impl file ${implFile} not readable, skipping role cross-ref`,
        );
        continue;
      }

      const rolesInImpl = harvestRolesFromSource(implSource);
      const declared = declaredPatternSet(manifest);

      // If the manifest has no usable declaration at all (R1/R2 already
      // surfaced that), and the impl has no roles either, there is nothing
      // sane to compare — skip mismatch reporting to avoid noise.
      if (declared.size === 0 && rolesInImpl.size === 0) continue;

      const mismatch = compareDeclaredVsRoles(declared, rolesInImpl);
      if (mismatch) {
        findings.push(
          shapeMismatchFinding(mismatch, {
            componentName,
            source,
            implFile,
            declared: [...declared].sort(),
            rolesInImpl: [...rolesInImpl].sort(),
          }),
        );
      }
    }

    const duration_ms = Date.now() - started;
    if (findings.length === 0) {
      return gateOk(this.name, duration_ms);
    }
    return gateFail(this.name, findings, duration_ms);
  }
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function defaultReadFile(absPath: string): Promise<string | null> {
  if (!(await fs.pathExists(absPath))) return null;
  return fs.readFile(absPath, 'utf8');
}

async function defaultPathExists(absPath: string): Promise<boolean> {
  return fs.pathExists(absPath);
}

const gate = new A11yPatternDeclaredGate();
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
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(`  - ${f.severity}${who}${where}: ${f.message}\n`);
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
