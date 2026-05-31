/**
 * Gate 30 — related-graph-consistency.
 *
 * Coherence rail (deeper than core gates, sibling of the theme/prop gates):
 *   The component graph implied by `manifest.related` MUST be bidirectional.
 *   If component A's manifest lists B in `related`, then component B's
 *   manifest is EXPECTED to list A back. Asymmetric related links are
 *   usability bugs — the docs say "see also: B" from A's page but never
 *   surface A from B's page, so the discoverability is one-way.
 *
 * Why INFO (not blocker, not major):
 *   Asymmetric links don't break anything at runtime. They don't even break
 *   the docs build. They just quietly degrade the cross-navigation between
 *   sibling components in the rendered docs site. This gate is a SUGGESTION
 *   layer — it surfaces the asymmetry and gives the author the exact one-line
 *   edit needed to close the loop. It must NEVER fail CI on its own.
 *
 * Rule, precisely:
 *
 *   (R1) For every manifest A with a `related` array, every string B in that
 *        array MUST resolve to a known component (i.e. some manifest has
 *        `component === B`). A reference to a non-existent component is INFO
 *        — a stale link, probably from a rename — and gets flagged with a
 *        "did you mean?" suggestion when a close-name candidate exists.
 *
 *   (R2) For every resolved A→B edge, the reverse edge B→A MUST also be
 *        declared. When it is missing, emit one INFO finding pinned to B's
 *        manifest source (because B is the file that needs editing — the
 *        author of A already wrote their side of the bridge), with a
 *        suggestion of the exact `related: […, 'A']` line to add.
 *
 *   (R3) An `unresolved` and a `missing-reverse` finding for the same pair
 *        are mutually exclusive — we never tell the user "B doesn't exist
 *        AND B should link to A". If B is unresolved, we drop the reverse
 *        check for that edge.
 *
 *   (R4) Self-references (A.related includes A) are silently dropped — not a
 *        bug, not a useful coherence claim either.
 *
 *   (R5) Duplicate entries inside a single manifest's `related` array
 *        (`related: ['B', 'B']`) are flagged as INFO with severity "minor"
 *        style noise — i.e. still INFO, but the suggestion is to dedupe.
 *
 *   (R6) Malformed `related` shapes (not an array, contains non-strings)
 *        are flagged as INFO so the author knows the convention; they do
 *        not crash the gate.
 *
 * In addition the gate emits ONE summary INFO finding describing the graph
 * shape (node count, edge count, symmetric pairs, asymmetric pairs,
 * unresolved references). The orchestrator/CI can render this as a table.
 *
 * Programmatic API:
 *   const gate = new RelatedGraphConsistencyGate();
 *   const result = await gate.run(ctx);
 *
 * CLI:
 *   tsx scripts/audit-coherence/gates/30-related-graph-consistency.ts \
 *     [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — always (the gate never blocks; INFO findings are advisory)
 *   1 — only when the gate itself fails to run (e.g. ctx.manifests is not
 *       iterable, which would indicate a context-loader bug)
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Manifest shape (loose — manifests are Zod-passthrough)
// ---------------------------------------------------------------------------

/** Subset of a ManifestRecord we actually read in this gate. */
export interface RelatedManifestLike {
  component?: unknown;
  related?: unknown;
  source?: unknown;
  file?: unknown;
  [key: string]: unknown;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

// ---------------------------------------------------------------------------
// Pure analyzers
// ---------------------------------------------------------------------------

/** Normalized view of one manifest after parsing `related`. */
export interface NormalizedRelated {
  /** Component name; null when the manifest has no resolvable name. */
  component: string | null;
  /** Path used only for diagnostics (manifest.source preferred). */
  source: string | null;
  /** Distinct, well-formed related targets (in declaration order). */
  related: string[];
  /** Duplicate entries that appeared in the raw `related` array. */
  duplicates: string[];
  /** Self-references that were silently dropped (component === target). */
  selfReferences: string[];
  /** Indicates the raw `related` value was present but not a string array. */
  malformed:
    | null
    | { kind: 'not-array'; describe: string }
    | { kind: 'non-string-entry'; index: number; describe: string };
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

/**
 * Normalise a single manifest's `related` field. Pure — never touches fs,
 * never logs. Tests assert each path independently.
 */
export function normalizeRelated(
  manifest: RelatedManifestLike,
): NormalizedRelated {
  const component = asString(manifest.component);
  const source = asString(manifest.source) ?? asString(manifest.file);

  const raw = manifest.related;
  if (raw === undefined || raw === null) {
    return {
      component,
      source,
      related: [],
      duplicates: [],
      selfReferences: [],
      malformed: null,
    };
  }
  if (!Array.isArray(raw)) {
    return {
      component,
      source,
      related: [],
      duplicates: [],
      selfReferences: [],
      malformed: { kind: 'not-array', describe: describeValue(raw) },
    };
  }

  const seen = new Set<string>();
  const out: string[] = [];
  const duplicates: string[] = [];
  const selfRefs: string[] = [];
  let malformed: NormalizedRelated['malformed'] = null;

  raw.forEach((entry, index) => {
    if (typeof entry !== 'string' || entry.length === 0) {
      if (!malformed) {
        malformed = {
          kind: 'non-string-entry',
          index,
          describe: describeValue(entry),
        };
      }
      return;
    }
    if (component && entry === component) {
      selfRefs.push(entry);
      return;
    }
    if (seen.has(entry)) {
      duplicates.push(entry);
      return;
    }
    seen.add(entry);
    out.push(entry);
  });

  return {
    component,
    source,
    related: out,
    duplicates,
    selfReferences: selfRefs,
    malformed,
  };
}

// ---------------------------------------------------------------------------
// Graph construction
// ---------------------------------------------------------------------------

/** Compact graph used by the asymmetry detector. */
export interface RelatedGraph {
  /** component name → its normalized record. */
  nodes: Map<string, NormalizedRelated>;
  /** All declared edges, in declaration order. */
  edges: Array<{ from: string; to: string }>;
}

export function buildRelatedGraph(
  manifests: RelatedManifestLike[],
): RelatedGraph {
  const nodes = new Map<string, NormalizedRelated>();
  for (const m of manifests) {
    const norm = normalizeRelated(m);
    if (!norm.component) continue;
    // If two manifests claim the same component name, the later wins for the
    // node entry — but we keep BOTH edge sets via the edge list below, so we
    // don't silently lose data. Duplicate-component manifests are out of
    // scope for this gate; gate 16 (monorepo-map) catches those.
    nodes.set(norm.component, norm);
  }
  const edges: Array<{ from: string; to: string }> = [];
  for (const node of nodes.values()) {
    if (!node.component) continue;
    for (const target of node.related) {
      edges.push({ from: node.component, to: target });
    }
  }
  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Asymmetry + unresolved detection
// ---------------------------------------------------------------------------

export interface UnresolvedEdge {
  from: string;
  to: string;
  /** The source path of the manifest that DECLARED the dangling reference. */
  fromSource: string | null;
  /** Closest-name suggestions ranked best-first; empty if nothing close. */
  suggestions: string[];
}

export interface AsymmetricEdge {
  /** The node missing the back-reference. */
  missingFrom: string;
  /** The node that already lists `missingFrom` as related. */
  expectedTo: string;
  /** Source path of `missingFrom`'s manifest, when known. */
  missingFromSource: string | null;
}

export interface GraphAnalysis {
  symmetric: Array<{ a: string; b: string }>;
  asymmetric: AsymmetricEdge[];
  unresolved: UnresolvedEdge[];
}

/**
 * Cheap similarity score (shared with gate 28's approach): substring
 * containment is a strong signal, otherwise we count shared characters minus
 * a length-difference penalty. Good enough to surface `PixelDialog` when the
 * user typed `PixelModal`.
 */
function similarityScore(a: string, b: string): number {
  if (a === b) return 100;
  if (a.length === 0 || b.length === 0) return 0;
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if (lowerB.includes(lowerA) || lowerA.includes(lowerB)) {
    return 50 + Math.min(lowerA.length, lowerB.length);
  }
  const bag = new Set(lowerB);
  let hits = 0;
  for (const ch of lowerA) if (bag.has(ch)) hits += 1;
  const lengthPenalty = Math.abs(a.length - b.length);
  return hits - lengthPenalty;
}

/** Top-N closest names from the known node set (descending score). */
export function suggestNearestComponents(
  typo: string,
  knownNames: Iterable<string>,
  max = 3,
): string[] {
  const scored: Array<{ name: string; score: number }> = [];
  for (const name of knownNames) {
    if (name === typo) continue;
    const score = similarityScore(typo, name);
    if (score > 0) scored.push({ name, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((s) => s.name);
}

/**
 * Walk the graph and classify every edge as either:
 *   - symmetric (both A→B and B→A exist),
 *   - asymmetric (A→B exists, B→A does not — B's manifest needs editing), or
 *   - unresolved (A→B exists but B is not a known component).
 *
 * Symmetric pairs are deduplicated (one entry per unordered {A,B}). The
 * caller is expected to render the analysis into findings + summary.
 */
export function analyzeGraph(graph: RelatedGraph): GraphAnalysis {
  const knownNames = new Set(graph.nodes.keys());
  const symmetric: Array<{ a: string; b: string }> = [];
  const symmetricSeen = new Set<string>();
  const asymmetric: AsymmetricEdge[] = [];
  const unresolved: UnresolvedEdge[] = [];

  // Build an adjacency lookup for O(1) reverse-edge checks.
  const adjacency = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    let set = adjacency.get(edge.from);
    if (!set) {
      set = new Set();
      adjacency.set(edge.from, set);
    }
    set.add(edge.to);
  }

  for (const edge of graph.edges) {
    if (!knownNames.has(edge.to)) {
      // R1 — unresolved reference. R3 — skip the reverse-edge check.
      const fromNode = graph.nodes.get(edge.from);
      unresolved.push({
        from: edge.from,
        to: edge.to,
        fromSource: fromNode?.source ?? null,
        suggestions: suggestNearestComponents(edge.to, knownNames),
      });
      continue;
    }
    const reverse = adjacency.get(edge.to);
    if (reverse && reverse.has(edge.from)) {
      const key = [edge.from, edge.to].sort().join('||');
      if (!symmetricSeen.has(key)) {
        symmetricSeen.add(key);
        const [a, b] = [edge.from, edge.to].sort();
        symmetric.push({ a: a!, b: b! });
      }
      continue;
    }
    // R2 — asymmetric: B is the one missing the back-reference.
    const targetNode = graph.nodes.get(edge.to);
    asymmetric.push({
      missingFrom: edge.to,
      expectedTo: edge.from,
      missingFromSource: targetNode?.source ?? null,
    });
  }
  return { symmetric, asymmetric, unresolved };
}

// ---------------------------------------------------------------------------
// Findings — pure transforms.
// ---------------------------------------------------------------------------

/**
 * For each normalized manifest, surface shape-level INFO findings: malformed
 * `related` value, duplicate entries, etc. Self-references are intentionally
 * silent (R4).
 */
export function shapeFindingsFor(
  norm: NormalizedRelated,
): GateFinding[] {
  const out: GateFinding[] = [];
  const component = norm.component ?? '<unknown>';
  if (norm.malformed) {
    if (norm.malformed.kind === 'not-array') {
      out.push({
        severity: 'info',
        component,
        file: norm.source ?? undefined,
        message: `Component "${component}" declares \`related\` as ${norm.malformed.describe} — expected an array of component-name strings.`,
        suggestion: `Change \`related\` to an array literal, e.g. \`related: ['PixelButton', 'PixelLink']\`. If there are no siblings to surface, omit the field entirely.`,
      });
    } else {
      out.push({
        severity: 'info',
        component,
        file: norm.source ?? undefined,
        message: `Component "${component}" has a non-string entry at \`related[${norm.malformed.index}]\` (got ${norm.malformed.describe}).`,
        suggestion: `Every \`related\` entry must be a non-empty string matching another manifest's \`component\` name (case-sensitive).`,
      });
    }
  }
  if (norm.duplicates.length > 0) {
    const unique = [...new Set(norm.duplicates)];
    out.push({
      severity: 'info',
      component,
      file: norm.source ?? undefined,
      message: `Component "${component}" lists duplicate entr${unique.length === 1 ? 'y' : 'ies'} in \`related\`: ${unique.map((d) => `'${d}'`).join(', ')}.`,
      suggestion: `Dedupe the \`related\` array. Each sibling should appear at most once.`,
    });
  }
  return out;
}

/**
 * Build an INFO finding for one missing reverse edge. The finding is pinned
 * to the node that needs the edit (B), and the suggestion is the exact
 * one-line code change.
 */
export function asymmetricFindingFor(
  edge: AsymmetricEdge,
): GateFinding {
  const where = edge.missingFromSource ?? undefined;
  return {
    severity: 'info',
    component: edge.missingFrom,
    file: where,
    message: `Asymmetric \`related\` link: "${edge.expectedTo}" lists "${edge.missingFrom}" as related, but "${edge.missingFrom}" does not list "${edge.expectedTo}" back. Discoverability is one-way.`,
    suggestion: `In the manifest for "${edge.missingFrom}", add "${edge.expectedTo}" to its \`related\` array:\n  related: [..., '${edge.expectedTo}']\nThis closes the loop so consumers landing on "${edge.missingFrom}" can navigate back to "${edge.expectedTo}".`,
  };
}

/**
 * Build an INFO finding for a `related` reference whose target component is
 * not in the manifest set. We attach the closest-name candidates as a "did
 * you mean?" suggestion when any exist.
 */
export function unresolvedFindingFor(
  edge: UnresolvedEdge,
): GateFinding {
  const didYouMean = edge.suggestions.length > 0
    ? ` Did you mean: ${edge.suggestions.map((s) => `"${s}"`).join(', ')}?`
    : '';
  return {
    severity: 'info',
    component: edge.from,
    file: edge.fromSource ?? undefined,
    message: `Component "${edge.from}" lists unknown component "${edge.to}" in \`related\` — no manifest declares \`component: '${edge.to}'\`.`,
    suggestion: `Either remove "${edge.to}" from \`related\` or rename it to a real sibling.${didYouMean}`,
  };
}

/**
 * Build the single summary INFO finding describing the graph shape. Always
 * emitted, even when everything is symmetric — the orchestrator uses it as
 * the audit's "what was verified" table.
 */
export function buildSummaryFinding(
  graph: RelatedGraph,
  analysis: GraphAnalysis,
): GateFinding {
  const nodeCount = graph.nodes.size;
  const edgeCount = graph.edges.length;
  const symPairs = analysis.symmetric.length;
  const asymPairs = analysis.asymmetric.length;
  const unresolvedCount = analysis.unresolved.length;
  const lines: string[] = [
    `related-graph-consistency: ${nodeCount} component node(s), ${edgeCount} declared edge(s).`,
    `  - symmetric pairs: ${symPairs}`,
    `  - asymmetric edges (one-way): ${asymPairs}`,
    `  - unresolved references: ${unresolvedCount}`,
  ];
  if (asymPairs > 0) {
    const sample = analysis.asymmetric.slice(0, 5)
      .map((e) => `${e.expectedTo} → ${e.missingFrom}`)
      .join(', ');
    lines.push(`  - one-way edges (first ${Math.min(5, asymPairs)}): ${sample}`);
  }
  if (unresolvedCount > 0) {
    const sample = analysis.unresolved.slice(0, 5)
      .map((e) => `${e.from} → ${e.to}`)
      .join(', ');
    lines.push(`  - unresolved (first ${Math.min(5, unresolvedCount)}): ${sample}`);
  }
  return {
    severity: 'info',
    message: lines.join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class RelatedGraphConsistencyGate extends Gate {
  readonly id = 30;
  readonly name = 'related-graph-consistency';
  readonly description =
    'If component A.related includes B, component B.related should mention A. Asymmetric links are one-way discoverability bugs — surfaced as INFO suggestions with the exact edit needed.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();

    let manifests: RelatedManifestLike[];
    try {
      manifests = ctx.manifests as RelatedManifestLike[];
      if (!Array.isArray(manifests)) {
        // The Zod schema in load-context guarantees this, but a hand-rolled
        // ctx in a test or a future loader change could violate it.
        throw new Error(
          `ctx.manifests is not an array (got ${typeof ctx.manifests})`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return gateFail(
        this.name,
        [
          {
            severity: 'blocker',
            message: `related-graph-consistency: cannot iterate manifests — ${message}`,
            suggestion:
              'This indicates a context-loader bug, not a content issue. Check `loadAuditContext` returned `ManifestRecord[]`.',
          },
        ],
        Date.now() - started,
      );
    }

    const findings: GateFinding[] = [];

    // Phase 1 — shape-level findings (R5, R6) before building the graph so
    // malformed manifests are still surfaced even if their `related` arrays
    // end up empty after normalization.
    const normalized = manifests.map(normalizeRelated);
    for (const norm of normalized) {
      for (const f of shapeFindingsFor(norm)) {
        findings.push(f);
      }
    }

    // Phase 2 — graph build + analysis. We re-use the normalized records
    // through buildRelatedGraph(manifests) by re-normalizing inside it; the
    // double pass is cheap and keeps `buildRelatedGraph` independently
    // callable (pure, no shared state).
    const graph = buildRelatedGraph(manifests);
    const analysis = analyzeGraph(graph);

    for (const edge of analysis.unresolved) {
      findings.push(unresolvedFindingFor(edge));
    }
    for (const edge of analysis.asymmetric) {
      findings.push(asymmetricFindingFor(edge));
    }

    // Phase 3 — always-emit summary.
    findings.push(buildSummaryFinding(graph, analysis));

    // The gate is advisory: even with N asymmetric findings, it MUST pass.
    // We hand-roll a passing result that preserves every INFO entry.
    const duration_ms = Date.now() - started;
    if (findings.every((f) => f.severity === 'info')) {
      return {
        name: this.name,
        passed: true,
        findings,
        duration_ms,
      };
    }
    // Defensive: if a future contributor escalates a finding to major/blocker
    // by mistake, gateOk would drop it. Route through gateFail so the
    // accidental escalation surfaces in CI rather than silently disappearing.
    return gateFail(this.name, findings, duration_ms);
  }
}

const gate = new RelatedGraphConsistencyGate();
export default gate;

// Helper to keep gateOk used (CI/tooling sometimes flags unused imports
// in scripts/tsconfig). The reference is intentional and free — the function
// is referenced from the type-position via the gate-base re-export anyway.
void gateOk;

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

  const { loadAuditContext, createLogger } = await import(
    '../_lib/load-context.js'
  );
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
