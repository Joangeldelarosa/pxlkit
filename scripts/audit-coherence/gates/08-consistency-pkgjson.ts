/**
 * Gate 8 — consistency-pkgjson
 *
 * Checks every package's `package.json` for two coherence properties:
 *
 *   1. `description` length is ≤ 155 characters (SEO / npm search limit).
 *   2. `description` contains at least one keyword from the package's
 *      primary category (e.g. `@pxlkit/effects` must mention something
 *      like "effect", "vfx", "animated", "particle"…).
 *
 * Findings are emitted at `info` severity — this gate never blocks the
 * audit. It surfaces drift that would otherwise erode discoverability
 * and brand voice over time.
 */

import * as path from 'node:path';
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
// Constants
// ---------------------------------------------------------------------------

export const DESCRIPTION_MAX_LENGTH = 155;

/**
 * Primary-category keyword bank. Each entry is keyed by a normalized
 * package slug (the last segment of the package name, e.g. `ui-kit`
 * from `@pxlkit/ui-kit`). The value is the union of acceptable
 * description tokens; matching is case-insensitive and substring-based
 * so plural/singular variants are tolerated.
 *
 * The `default` bucket is used when a package has no specific mapping
 * — it just requires *some* brand-aligned vocabulary.
 */
export const CATEGORY_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  'ui-kit': [
    'ui',
    'component',
    'button',
    'form',
    'modal',
    'card',
    'table',
    'toast',
    'kit',
  ],
  ui: ['ui', 'primitive', 'component', 'token', 'design system'],
  core: [
    'core',
    'engine',
    'render',
    'icon',
    'svg',
    'utility',
    'type',
    'toolkit',
  ],
  effects: [
    'effect',
    'vfx',
    'animated',
    'animation',
    'particle',
    'explosion',
    'glow',
    'flame',
    'shockwave',
  ],
  feedback: [
    'feedback',
    'notification',
    'toast',
    'alert',
    'status',
    'badge',
    'shield',
    'checkmark',
  ],
  gamification: [
    'gamification',
    'game',
    'rpg',
    'achievement',
    'reward',
    'trophy',
    'gaming',
  ],
  parallax: ['parallax', '3d', 'depth', 'layer', 'perspective', 'mouse'],
  social: [
    'social',
    'community',
    'emoji',
    'message',
    'heart',
    'share',
    'user',
    'reaction',
    'media',
  ],
  weather: [
    'weather',
    'climate',
    'forecast',
    'temperature',
    'cloud',
    'rain',
    'sun',
    'storm',
  ],
  voxel: [
    'voxel',
    '3d',
    'three',
    'procedural',
    'world',
    'block',
    'cube',
    'minecraft',
  ],
};

const DEFAULT_KEYWORDS: readonly string[] = [
  'pixel',
  'pxlkit',
  'retro',
  '8-bit',
  '16-bit',
  'icon',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PackageJsonShape {
  name?: string;
  description?: string;
  keywords?: readonly string[];
}

/**
 * Strips the npm scope (`@pxlkit/`) and returns the bare package slug
 * lowercased — used to look up the keyword bank.
 */
export function normalizePackageSlug(packageName: string): string {
  const trimmed = packageName.trim();
  const slashIdx = trimmed.lastIndexOf('/');
  const base = slashIdx >= 0 ? trimmed.slice(slashIdx + 1) : trimmed;
  return base.toLowerCase();
}

/**
 * Resolves the keyword bank for a package. Falls back to
 * `DEFAULT_KEYWORDS` when no explicit mapping exists so the gate
 * never produces a vacuous "missing keyword" finding for new
 * packages — it just enforces the brand floor.
 */
export function keywordsForPackage(packageName: string): readonly string[] {
  const slug = normalizePackageSlug(packageName);
  return CATEGORY_KEYWORDS[slug] ?? DEFAULT_KEYWORDS;
}

/**
 * Case-insensitive substring match: returns the first keyword that
 * occurs in `description`, or `null` if none does.
 */
export function findMatchingKeyword(
  description: string,
  keywords: readonly string[],
): string | null {
  const haystack = description.toLowerCase();
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) return kw;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Programmatic API
// ---------------------------------------------------------------------------

export interface PackageJsonCheckOptions {
  maxLength?: number;
}

export interface PackageJsonCheckResult {
  findings: GateFinding[];
}

/**
 * Pure check against a single `package.json` payload — no I/O.
 * Exposed for unit tests and for callers that already hold the
 * parsed JSON.
 */
export function checkPackageJson(
  pkg: PackageJsonShape,
  filePath: string,
  options: PackageJsonCheckOptions = {},
): PackageJsonCheckResult {
  const maxLength = options.maxLength ?? DESCRIPTION_MAX_LENGTH;
  const findings: GateFinding[] = [];
  const packageName = pkg.name ?? '(unnamed)';
  const relativeFile = filePath;

  const description = typeof pkg.description === 'string' ? pkg.description : '';

  if (!description.trim()) {
    findings.push({
      severity: 'info',
      file: relativeFile,
      component: packageName,
      message: `package ${packageName} has no "description" field`,
      suggestion:
        'add a short tagline (≤155 chars) that mentions the primary category',
    });
    return { findings };
  }

  if (description.length > maxLength) {
    findings.push({
      severity: 'info',
      file: relativeFile,
      component: packageName,
      message: `description is ${description.length} chars, exceeds ${maxLength}-char limit`,
      suggestion: `trim by ${description.length - maxLength} chars — npm and most search engines truncate beyond this`,
    });
  }

  const keywords = keywordsForPackage(packageName);
  const matched = findMatchingKeyword(description, keywords);
  if (!matched) {
    findings.push({
      severity: 'info',
      file: relativeFile,
      component: packageName,
      message: `description does not mention any primary-category keyword for ${packageName}`,
      suggestion: `include at least one of: ${keywords.slice(0, 6).join(', ')}`,
    });
  }

  return { findings };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class ConsistencyPkgJsonGate extends Gate {
  id = 8;
  name = 'consistency-pkgjson';
  description =
    'package.json description should be ≤155 chars and contain at least one keyword from the package\'s primary category';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    for (const ref of ctx.packageJsons) {
      let raw: PackageJsonShape | null = null;
      try {
        raw = (await fs.readJson(ref.path)) as PackageJsonShape;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'info',
          file: path.relative(ctx.repoRoot, ref.path),
          component: ref.package,
          message: `failed to read package.json: ${msg}`,
        });
        continue;
      }

      const relativeFile = path.relative(ctx.repoRoot, ref.path);
      const { findings: pkgFindings } = checkPackageJson(raw, relativeFile);
      findings.push(...pkgFindings);
    }

    const duration_ms = Date.now() - started;
    if (findings.length === 0) return gateOk(this.name, duration_ms);
    return gateFail(this.name, findings, duration_ms);
  }
}

const gate = new ConsistencyPkgJsonGate();
export default gate;
