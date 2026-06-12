/**
 * 23-prop-inheritance-base — Cross-component prop-inheritance coherence gate.
 *
 * Purpose
 * -------
 * Validate two interlocking invariants in `packages/ui-kit/src`:
 *
 *  1. **Rest-spread safety.** Any component whose body spreads `...rest` into
 *     a JSX intrinsic MUST declare its Props as `extends React.HTMLAttributes<
 *     HTMLElement>` (or one of the typed HTML interfaces, e.g.
 *     `React.ButtonHTMLAttributes<HTMLButtonElement>`) — directly or via
 *     `Omit<React.HTMLAttributes<...>, ...>`. Spreading untyped `...rest`
 *     means consumers cannot pass `aria-*`, `data-*`, `onClick`, etc, and
 *     TypeScript silently accepts garbage. MAJOR.
 *
 *     Recognised equivalents (NOT findings):
 *       - SVG-rooted components extending `React.SVGAttributes<...>` /
 *         `React.SVGProps<...>` — HTMLAttributes would be the WRONG base for
 *         an `<svg>` root.
 *       - Transitive inheritance: Props extending another `*Props` interface
 *         (anywhere in the scan set) that itself — directly or transitively —
 *         extends an HTMLAttributes/SVGAttributes-family base
 *         (e.g. `PixelEqualHeightGridProps extends Omit<PixelGridProps, 'align'>`).
 *       - Compositional `*Root` components pair with the base Props name:
 *         `PixelCarouselRoot` → `PixelCarouselProps` (the public component is
 *         the Root re-exported under the base name).
 *
 *  2. **Layout-primitive base signature.** The seven layout primitives
 *     (`PixelBox`, `PixelStack`, `PixelCluster`, `PixelGrid`, `PixelCenter`,
 *     `PixelContainer`, `PixelTwoColumn`) MUST share an identical base prop
 *     surface: each must accept `className?`, `as?`, and `...HTMLAttributes`
 *     (the first two being a deliberate part of the contract; the third
 *     inherited via `extends React.HTMLAttributes<HTMLDivElement>`). MAJOR on
 *     any divergence — the whole point of these primitives is interchangeable
 *     composition by consumers.
 *
 * Why this matters
 * ----------------
 * The Joangel/pxlkit "theme + prop inheritance" coherence guarantee depends on
 * every Pixel* component being a *transparent* wrapper over its intrinsic
 * element. The moment one primitive forgets to extend `HTMLAttributes`, its
 * `<PixelBox onClick=...>` stops typing. The moment another diverges on `as`,
 * a developer can't refactor `<PixelStack>` → `<PixelCluster>` without
 * touching consumer code. Both regressions are silent — only this gate
 * catches them.
 *
 * Programmatic API
 * ----------------
 *   import PropInheritanceBaseGate from './gates/23-prop-inheritance-base.js';
 *   const gate = new PropInheritanceBaseGate();
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper)
 * ------------------
 *   tsx scripts/audit-coherence/gates/23-prop-inheritance-base.ts [--root <dir>] [--json]
 *
 * Exit codes: 0 on pass, 1 on any major or blocker finding.
 *
 * Safety: read-only. Touches no files. Does not spawn external processes.
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
import { createLogger, loadAuditContext } from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScannedSource {
  /** Absolute, posix-normalised path. */
  file: string;
  /** Raw utf-8 contents. */
  content: string;
}

export interface PropsInterface {
  /** Identifier as declared, e.g. `PixelBoxProps`. */
  name: string;
  /** The raw `extends` clause text, with whitespace collapsed. Empty when no extends. */
  extendsClause: string;
  /** Whether the `extends` clause references some `React.HTMLAttributes<...>` (directly or via Omit). */
  extendsHTMLAttributes: boolean;
  /** The exact HTMLAttributes interface name (e.g. `HTMLAttributes`, `ButtonHTMLAttributes`). */
  htmlAttrsInterface: string | null;
  /** 1-based line where the declaration begins. */
  line: number;
  /** Whether the interface body declares an `as?` prop. */
  declaresAs: boolean;
  /** Whether the interface body declares a `className?` prop (defensive — usually inherited). */
  declaresClassNameProp: boolean;
}

export interface ComponentDescriptor {
  /** Display name as inferred from `forwardRef(...function NAME)` or `const NAME = ...`. */
  componentName: string | null;
  /** Whether the body destructures `...rest` (any name actually — see `restIdentifier`). */
  spreadsRest: boolean;
  /** The identifier used for the rest pattern (e.g. `rest`, `props`, `others`). */
  restIdentifier: string | null;
  /** Whether the JSX body actually spreads that identifier into the root element. */
  forwardsRestToJSX: boolean;
}

export interface FileAnalysis {
  file: string;
  props: PropsInterface[];
  components: ComponentDescriptor[];
}

export interface PropInheritanceBaseGateOptions {
  /** Override file discovery (used by tests). */
  discoverFiles?: (ctx: AuditContext) => Promise<ScannedSource[]>;
  /** Override the analysis step (used by tests). */
  analyzeFile?: (src: ScannedSource) => FileAnalysis;
  /**
   * Override the list of layout-primitive component names that the gate
   * enforces a common base signature for. Defaults to the canonical seven.
   */
  layoutPrimitives?: readonly string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_NAME = 'prop-inheritance-base';

const SCAN_GLOB = 'packages/ui-kit/src/**/Pixel*.tsx';
const SCAN_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
];

export const LAYOUT_PRIMITIVES: readonly string[] = [
  'PixelBox',
  'PixelStack',
  'PixelCluster',
  'PixelGrid',
  'PixelCenter',
  'PixelContainer',
  'PixelTwoColumn',
] as const;

/**
 * Set of recognised React HTMLAttributes-family interface names. If a Props
 * interface extends any of these (directly or via Omit), we consider it
 * "rest-spread safe" — the consumer can pass any DOM attribute and TS will
 * type-check it.
 */
const HTML_ATTR_INTERFACES = new Set([
  'HTMLAttributes',
  'AllHTMLAttributes',
  'AnchorHTMLAttributes',
  'AreaHTMLAttributes',
  'AudioHTMLAttributes',
  'BaseHTMLAttributes',
  'BlockquoteHTMLAttributes',
  'ButtonHTMLAttributes',
  'CanvasHTMLAttributes',
  'ColHTMLAttributes',
  'ColgroupHTMLAttributes',
  'DataHTMLAttributes',
  'DetailsHTMLAttributes',
  'DelHTMLAttributes',
  'DialogHTMLAttributes',
  'EmbedHTMLAttributes',
  'FieldsetHTMLAttributes',
  'FormHTMLAttributes',
  'HtmlHTMLAttributes',
  'IframeHTMLAttributes',
  'ImgHTMLAttributes',
  'InsHTMLAttributes',
  'InputHTMLAttributes',
  'KeygenHTMLAttributes',
  'LabelHTMLAttributes',
  'LiHTMLAttributes',
  'LinkHTMLAttributes',
  'MapHTMLAttributes',
  'MenuHTMLAttributes',
  'MediaHTMLAttributes',
  'MetaHTMLAttributes',
  'MeterHTMLAttributes',
  'ObjectHTMLAttributes',
  'OlHTMLAttributes',
  'OptgroupHTMLAttributes',
  'OptionHTMLAttributes',
  'OutputHTMLAttributes',
  'ParamHTMLAttributes',
  'ProgressHTMLAttributes',
  'QuoteHTMLAttributes',
  'ScriptHTMLAttributes',
  'SelectHTMLAttributes',
  'SourceHTMLAttributes',
  'StyleHTMLAttributes',
  'TableHTMLAttributes',
  'TdHTMLAttributes',
  'TextareaHTMLAttributes',
  'ThHTMLAttributes',
  'TimeHTMLAttributes',
  'TrackHTMLAttributes',
  'VideoHTMLAttributes',
  'WebViewHTMLAttributes',
]);

/**
 * SVG-family attribute interfaces. For a component whose root element is an
 * SVG intrinsic (`<svg>`, `<path>`, ...), these are the CORRECT rest-spread
 * bases — `HTMLAttributes` would be wrong (no SVG-specific attrs, wrong
 * element type param). Treated as rest-spread safe alongside the HTML set.
 */
const SVG_ATTR_INTERFACES = new Set(['SVGAttributes', 'SVGProps']);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function lineOf(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * Replace string-literal and comment regions with same-length whitespace so
 * regex matches against the structural source don't accidentally pick up
 * commented-out interfaces or string contents while preserving offsets.
 */
export function stripStringsAndComments(src: string): string {
  let out = '';
  let i = 0;
  let inString: '"' | "'" | '`' | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString) {
      if (ch === '\n') {
        out += '\n';
        if (inString !== '`') inString = null;
      } else {
        out += ' ';
      }
      if (ch === '\\' && i + 1 < src.length) {
        out += src[i + 1] === '\n' ? '\n' : ' ';
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      out += ' ';
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let j = i; j < stop; j++) {
        out += src[j] === '\n' ? '\n' : ' ';
      }
      i = stop;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/**
 * Given a position pointing at an open `{`, find the matching close brace.
 * Returns -1 if no match. Operates on already string/comment-stripped source.
 */
function findMatchingBrace(src: string, openIndex: number): number {
  if (src[openIndex] !== '{') return -1;
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

const RE_INTERFACE_DECL =
  /(?:^|[\s;])(?:export\s+)?interface\s+(?<name>[A-Z]\w*Props)\s*(?:extends\s+(?<ext>[^{]+))?\{/gm;

const RE_TYPE_DECL =
  /(?:^|[\s;])(?:export\s+)?type\s+(?<name>[A-Z]\w*Props)\s*=\s*(?<rhs>[^;]+);/gm;

/**
 * Recognises any reference to `React.HTMLAttributes<…>`, `HTMLAttributes<…>`,
 * `ButtonHTMLAttributes<…>`, `Omit<React.HTMLAttributes<…>, …>`, etc. — plus
 * the SVG-family equivalents (`SVGAttributes`, `SVGProps`) which are the
 * correct rest-spread base for svg-rooted components.
 *
 * Returns the bare interface name (e.g. "HTMLAttributes") on match, null on
 * no match.
 */
export function detectHTMLAttrsInterface(text: string): string | null {
  // Match either `React.XxxHTMLAttributes` or bare `XxxHTMLAttributes`,
  // tolerating leading `Omit<` wrapper or `&` intersections.
  const re = /\b(?:React\s*\.\s*)?([A-Z][A-Za-z]*HTMLAttributes|HTMLAttributes|AllHTMLAttributes|SVGAttributes|SVGProps)\s*</;
  const m = re.exec(text);
  if (!m) return null;
  const name = m[1];
  if (HTML_ATTR_INTERFACES.has(name) || SVG_ATTR_INTERFACES.has(name)) return name;
  return null;
}

/**
 * Transitive rest-spread-safety resolver. A Props interface that does NOT
 * directly extend an HTMLAttributes/SVGAttributes-family base may still be
 * safe when its extends clause references another `*Props` interface (e.g.
 * `extends Omit<PixelGridProps, 'align'>`) that itself — directly or further
 * up the chain — extends one. Resolution is scoped to interfaces discovered
 * in the scan set; unresolvable references stay UNSAFE (conservative).
 *
 * Returns the base interface name the chain bottoms out at, or null.
 */
export function resolveTransitiveHTMLAttributes(
  iface: PropsInterface,
  propsByName: ReadonlyMap<string, PropsInterface>,
  seen: Set<string> = new Set(),
): string | null {
  if (iface.extendsHTMLAttributes) return iface.htmlAttrsInterface;
  if (seen.has(iface.name)) return null;
  seen.add(iface.name);
  // Local regex instance — module-level lastIndex state would corrupt the
  // outer iteration during recursion.
  const reRef = /\b([A-Z]\w*Props)\b/g;
  let m: RegExpExecArray | null;
  while ((m = reRef.exec(iface.extendsClause)) !== null) {
    const refName = m[1];
    if (refName === iface.name) continue;
    const target = propsByName.get(refName);
    if (!target) continue;
    const resolved = resolveTransitiveHTMLAttributes(target, propsByName, seen);
    if (resolved) return resolved;
  }
  return null;
}

/**
 * Detect whether the interface body text declares a prop named `as` (with `?`
 * or without). We look only at top-level keys to avoid matching `as` inside
 * a nested object type.
 */
function bodyDeclaresProp(body: string, prop: string): boolean {
  // Strip nested braces so we only see top-level prop keys.
  let depth = 0;
  let topLevel = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') {
      depth++;
      topLevel += ' ';
      continue;
    }
    if (c === '}') {
      depth--;
      topLevel += ' ';
      continue;
    }
    topLevel += depth === 0 ? c : ' ';
  }
  // Member declarations look like `<prop>?:` or `<prop>:` at a line start
  // (possibly after `,` or `;`). Tolerate JSDoc above.
  const re = new RegExp(`(?:^|[;,\\n])\\s*(?:readonly\\s+)?${prop}\\s*\\??\\s*:`, 'm');
  return re.test(topLevel);
}

export function analyzeFile(src: ScannedSource): FileAnalysis {
  const cleaned = stripStringsAndComments(src.content);

  const props: PropsInterface[] = [];

  // 1. interface PixelXProps extends ... { ... }
  RE_INTERFACE_DECL.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_INTERFACE_DECL.exec(cleaned)) !== null) {
    const name = m.groups?.name ?? '';
    const ext = (m.groups?.ext ?? '').replace(/\s+/g, ' ').trim();
    const openIdx = cleaned.indexOf('{', m.index);
    const closeIdx = openIdx >= 0 ? findMatchingBrace(cleaned, openIdx) : -1;
    const body = openIdx >= 0 && closeIdx > openIdx ? cleaned.slice(openIdx + 1, closeIdx) : '';
    const htmlAttrs = detectHTMLAttrsInterface(ext);
    props.push({
      name,
      extendsClause: ext,
      extendsHTMLAttributes: htmlAttrs !== null,
      htmlAttrsInterface: htmlAttrs,
      line: lineOf(cleaned, m.index),
      declaresAs: bodyDeclaresProp(body, 'as'),
      declaresClassNameProp: bodyDeclaresProp(body, 'className'),
    });
  }

  // 2. type PixelXProps = ... (sometimes used for unions). We still detect.
  RE_TYPE_DECL.lastIndex = 0;
  while ((m = RE_TYPE_DECL.exec(cleaned)) !== null) {
    const name = m.groups?.name ?? '';
    const rhs = (m.groups?.rhs ?? '').replace(/\s+/g, ' ').trim();
    const htmlAttrs = detectHTMLAttrsInterface(rhs);
    // Avoid double-recording when the name was also captured as an interface.
    if (props.some((p) => p.name === name)) continue;
    props.push({
      name,
      extendsClause: rhs,
      extendsHTMLAttributes: htmlAttrs !== null,
      htmlAttrsInterface: htmlAttrs,
      line: lineOf(cleaned, m.index),
      // `type` aliases don't have an interface body — we can't introspect props
      // easily, so we conservatively report `false`. Layout-primitive check
      // explicitly looks for `interface`, so this only affects rest-spread.
      declaresAs: false,
      declaresClassNameProp: false,
    });
  }

  // 3. Detect components + whether they spread `...<id>` from props into JSX.
  // We use brace-matching anchors instead of fully-regex'd bodies, because the
  // function body usually contains arbitrary nested braces (JSX expressions,
  // nested blocks) that a single regex can't reliably span.
  const components: ComponentDescriptor[] = [];

  // Anchor: `const PixelX = forwardRef<...>(function ...(`
  const RE_FORWARD_REF_ANCHOR =
    /\b(?:export\s+)?const\s+(?<name>[A-Z]\w*)\s*=\s*forwardRef\s*<[^>]+>\s*\(\s*function\s+\w*\s*\(/g;
  // Anchor: `function PixelX(` (plain functional component) — at top level.
  const RE_FUNCTION_COMP_ANCHOR =
    /\b(?:export\s+)?function\s+(?<name>[A-Z]\w*)\s*\(/g;
  // Anchor: `const PixelX = (` (plain arrow component).
  const RE_ARROW_COMP_ANCHOR =
    /\b(?:export\s+)?const\s+(?<name>[A-Z]\w*)\s*(?::\s*[^=]+)?=\s*\(/g;

  const seen = new Set<string>();

  /**
   * Starting at `openParenIdx` (a `(` character), parse:
   *  - the destructure pattern `{ ... }` (if any)
   *  - then locate the following `{` that opens the function body
   *  - balance braces to find the body's closing `}`
   * Returns { destructure, body } or null if shape doesn't match.
   */
  const parseAfterParen = (
    src: string,
    openParenIdx: number,
  ): { destructure: string; body: string } | null => {
    let i = openParenIdx + 1;
    // Skip whitespace.
    while (i < src.length && /\s/.test(src[i])) i++;
    let destructure = '';
    if (src[i] === '{') {
      const closeBrace = findMatchingBrace(src, i);
      if (closeBrace < 0) return null;
      destructure = src.slice(i + 1, closeBrace);
      i = closeBrace + 1;
    }
    // Walk through the rest of the param list looking for matching `)`.
    let parenDepth = 1;
    while (i < src.length && parenDepth > 0) {
      const c = src[i];
      if (c === '(') parenDepth++;
      else if (c === ')') parenDepth--;
      i++;
    }
    if (parenDepth !== 0) return null;
    // Allow optional `=>` for arrow components.
    while (i < src.length && /[\s=>]/.test(src[i]) && !(src[i] === '{')) i++;
    if (src[i] !== '{') return null;
    const bodyClose = findMatchingBrace(src, i);
    if (bodyClose < 0) return null;
    const body = src.slice(i + 1, bodyClose);
    return { destructure, body };
  };

  const harvest = (re: RegExp): void => {
    re.lastIndex = 0;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(cleaned)) !== null) {
      const name = mm.groups?.name ?? '';
      if (!name || seen.has(name)) continue;
      // Find the `(` at the end of the anchor match.
      const anchorEnd = mm.index + mm[0].length - 1;
      if (cleaned[anchorEnd] !== '(') continue;
      const parsed = parseAfterParen(cleaned, anchorEnd);
      if (!parsed) continue;
      const restMatch = /\.\.\.\s*(?<id>[A-Za-z_$][\w$]*)/.exec(parsed.destructure);
      const restIdentifier = restMatch?.groups?.id ?? null;
      const spreadsRest = restIdentifier !== null;
      let forwardsRestToJSX = false;
      if (restIdentifier) {
        const jsxSpreadRe = new RegExp(`\\{\\s*\\.\\.\\.\\s*${restIdentifier}\\s*\\}`);
        forwardsRestToJSX = jsxSpreadRe.test(parsed.body);
      }
      seen.add(name);
      components.push({
        componentName: name,
        spreadsRest,
        restIdentifier,
        forwardsRestToJSX,
      });
    }
  };

  harvest(RE_FORWARD_REF_ANCHOR);
  harvest(RE_FUNCTION_COMP_ANCHOR);
  harvest(RE_ARROW_COMP_ANCHOR);

  return { file: src.file, props, components };
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverFilesDefault(ctx: AuditContext): Promise<ScannedSource[]> {
  const files = await fgGlob(SCAN_GLOB, {
    cwd: ctx.repoRoot,
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: SCAN_IGNORE,
  });
  const out: ScannedSource[] = [];
  for (const file of files.sort()) {
    try {
      const content = await fs.readFile(file, 'utf8');
      out.push({ file, content });
    } catch (err) {
      ctx.logger.debug(
        `skip unreadable file ${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class PropInheritanceBaseGate extends Gate {
  readonly id = 23;
  readonly name = GATE_NAME;
  readonly description =
    'Verify every Pixel* component that forwards ...rest extends React.HTMLAttributes, and that all layout primitives share an identical { className?, as?, ...HTMLAttributes } base signature.';

  private readonly discover: (ctx: AuditContext) => Promise<ScannedSource[]>;
  private readonly analyze: (src: ScannedSource) => FileAnalysis;
  private readonly primitives: readonly string[];

  constructor(options: PropInheritanceBaseGateOptions = {}) {
    super();
    this.discover = options.discoverFiles ?? discoverFilesDefault;
    this.analyze = options.analyzeFile ?? analyzeFile;
    this.primitives = options.layoutPrimitives ?? LAYOUT_PRIMITIVES;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const files = await this.discover(ctx);

    if (files.length === 0) {
      ctx.logger.debug('no Pixel* component files in scan scope — gate passes vacuously');
      return gateOk(this.name, Date.now() - start);
    }

    const findings: GateFinding[] = [];

    // Map<componentName, { file, analysis }> — used by the layout-primitive
    // coherence check to look up canonical Props per primitive.
    const componentIndex = new Map<
      string,
      { file: string; analysis: FileAnalysis }
    >();

    // ---------------------------------------------------------------------
    // Pass 1: analyze every file, index components AND Props interfaces.
    // The global Props index powers transitive inheritance resolution
    // (PixelDerivedProps extends Omit<PixelGridProps, 'align'> — PixelGrid
    // may live in another file).
    // ---------------------------------------------------------------------
    const analyses: Array<{ src: ScannedSource; analysis: FileAnalysis }> = [];
    const propsByName = new Map<string, PropsInterface>();

    for (const src of files) {
      let analysis: FileAnalysis;
      try {
        analysis = this.analyze(src);
      } catch (err) {
        findings.push({
          severity: 'major',
          file: toPosix(src.file),
          message: `analyzer threw: ${err instanceof Error ? err.message : String(err)}`,
          suggestion:
            'Inspect the file manually; the analyzer should never throw — file a bug if this persists.',
        });
        continue;
      }

      analyses.push({ src, analysis });

      // Index each component for the cross-file primitives check.
      for (const c of analysis.components) {
        if (c.componentName && !componentIndex.has(c.componentName)) {
          componentIndex.set(c.componentName, { file: src.file, analysis });
        }
      }
      for (const p of analysis.props) {
        if (!propsByName.has(p.name)) propsByName.set(p.name, p);
      }
    }

    // ---------------------------------------------------------------------
    // Pass 2 / Check 1: rest-spread safety
    // ---------------------------------------------------------------------
    for (const { src, analysis } of analyses) {
      for (const comp of analysis.components) {
        if (!comp.spreadsRest || !comp.forwardsRestToJSX) continue;
        // Heuristic: match the component to its Props interface by name
        // (PixelX → PixelXProps). Compositional internals named `PixelXRoot`
        // pair with the base name (`PixelXProps`) — the Root IS the public
        // component, re-exported under the base name. If the file declares
        // exactly one Props interface, fall back to that.
        const candidatePropsName = `${comp.componentName}Props`;
        const candidateNames = [candidatePropsName];
        if (comp.componentName && /Root$/.test(comp.componentName)) {
          candidateNames.push(
            `${comp.componentName.replace(/Root$/, '')}Props`,
          );
        }
        let propsIface =
          analysis.props.find((p) => candidateNames.includes(p.name)) ??
          (analysis.props.length === 1 ? analysis.props[0] : undefined);

        if (!propsIface) {
          // Couldn't pair — emit minor info finding so the maintainer knows
          // we couldn't verify, but don't fail the gate.
          findings.push({
            severity: 'info',
            file: toPosix(src.file),
            component: comp.componentName ?? undefined,
            message: `${comp.componentName} forwards ...${comp.restIdentifier} but no matching ${candidatePropsName} interface was found to verify inheritance`,
            suggestion: `Declare \`export interface ${candidatePropsName} extends React.HTMLAttributes<HTMLDivElement> { ... }\` so consumers get type-checked DOM attributes.`,
          });
          continue;
        }

        if (!propsIface.extendsHTMLAttributes) {
          // Not direct — maybe transitively safe via another Props interface
          // in the scan set (e.g. extends Omit<PixelGridProps, 'align'>).
          const inherited = resolveTransitiveHTMLAttributes(
            propsIface,
            propsByName,
          );
          if (inherited) {
            ctx.logger.debug(
              `${toPosix(src.file)} ${comp.componentName} — ${propsIface.name} transitively extends ${inherited}, rest-spread safe`,
            );
            continue;
          }
          findings.push({
            severity: 'major',
            file: toPosix(src.file),
            component: comp.componentName ?? undefined,
            message: `${comp.componentName} forwards \`...${comp.restIdentifier}\` to JSX but ${propsIface.name} (line ${propsIface.line}) does not extend \`React.HTMLAttributes<...>\`. Consumers cannot type aria-*, data-*, onClick, etc.`,
            suggestion: `Update the declaration to:\n  export interface ${propsIface.name} extends React.HTMLAttributes<HTMLDivElement> {\n    /* existing pixel-art props (tone, surface, ...) */\n  }\nIf the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>; SVGAttributes<SVGSVGElement> for svg roots). If you need to redefine an attribute, use \`Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>\`.`,
          });
        }
      }
    }

    // ---------------------------------------------------------------------
    // Check 2: layout-primitive base signature coherence
    // ---------------------------------------------------------------------
    const presentPrimitives = this.primitives.filter((p) =>
      componentIndex.has(p),
    );

    if (presentPrimitives.length > 0) {
      // Per-primitive shape check.
      const shapes: Array<{
        component: string;
        file: string;
        extendsHTMLAttributes: boolean;
        htmlAttrsInterface: string | null;
        declaresAs: boolean;
        propsName: string | null;
      }> = [];

      for (const compName of presentPrimitives) {
        const entry = componentIndex.get(compName);
        if (!entry) continue;
        const propsName = `${compName}Props`;
        const propsIface =
          entry.analysis.props.find((p) => p.name === propsName) ??
          (entry.analysis.props.length === 1
            ? entry.analysis.props[0]
            : undefined);

        if (!propsIface) {
          findings.push({
            severity: 'major',
            file: toPosix(entry.file),
            component: compName,
            message: `Layout primitive ${compName} has no discoverable ${propsName} interface to verify its base signature`,
            suggestion: `Declare \`export interface ${propsName} extends React.HTMLAttributes<HTMLDivElement> { as?: keyof React.JSX.IntrinsicElements; surface?: Surface; /* ...rest of layout props */ }\` so the gate can verify it.`,
          });
          shapes.push({
            component: compName,
            file: entry.file,
            extendsHTMLAttributes: false,
            htmlAttrsInterface: null,
            declaresAs: false,
            propsName: null,
          });
          continue;
        }

        shapes.push({
          component: compName,
          file: entry.file,
          extendsHTMLAttributes: propsIface.extendsHTMLAttributes,
          htmlAttrsInterface: propsIface.htmlAttrsInterface,
          declaresAs: propsIface.declaresAs,
          propsName: propsIface.name,
        });

        if (!propsIface.extendsHTMLAttributes) {
          findings.push({
            severity: 'major',
            file: toPosix(entry.file),
            component: compName,
            message: `Layout primitive ${compName} (${propsIface.name}, line ${propsIface.line}) does not extend \`React.HTMLAttributes<HTMLDivElement>\`. All layout primitives MUST share the same { className?, as?, ...HTMLAttributes } base — otherwise consumers can't swap one for another without a refactor.`,
            suggestion: `Change to:\n  export interface ${propsIface.name} extends React.HTMLAttributes<HTMLDivElement> { ... }\nMirror the exact shape used by PixelBox/PixelStack so consumers can refactor between primitives freely.`,
          });
        }

        if (!propsIface.declaresAs) {
          findings.push({
            severity: 'major',
            file: toPosix(entry.file),
            component: compName,
            message: `Layout primitive ${compName} (${propsIface.name}, line ${propsIface.line}) is missing the required \`as?\` polymorphic prop. All seven layout primitives MUST accept \`as?: keyof React.JSX.IntrinsicElements\` (or a narrower union) so consumers can polymorphically render any landmark/section element.`,
            suggestion: `Add to ${propsIface.name}:\n  as?: keyof React.JSX.IntrinsicElements;\nAnd in the component body destructure + use it: \`const Comp = (as ?? 'div') as 'div';\` then \`<Comp ref={ref} {...rest}>\`.`,
          });
        }
      }

      // Cross-primitive coherence: all extending interfaces must match.
      const extensions = new Set(
        shapes
          .filter((s) => s.extendsHTMLAttributes)
          .map((s) => s.htmlAttrsInterface ?? '?'),
      );
      if (extensions.size > 1) {
        const grouped = shapes
          .filter((s) => s.htmlAttrsInterface)
          .map((s) => `${s.component} → ${s.htmlAttrsInterface}`)
          .join(', ');
        findings.push({
          severity: 'major',
          message: `Layout primitives diverge on which HTMLAttributes interface they extend: ${grouped}. All seven layout primitives MUST extend the SAME interface (canonical: \`React.HTMLAttributes<HTMLDivElement>\`) so consumers can compose them interchangeably.`,
          suggestion:
            'Normalise every layout primitive to `extends React.HTMLAttributes<HTMLDivElement>`. If one primitive truly needs a different root element type, hoist it out of the layout-primitive set and document it as a non-primitive.',
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
          'Usage: tsx scripts/audit-coherence/gates/23-prop-inheritance-base.ts [options]',
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
  const gate = new PropInheritanceBaseGate();
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
        `prop-inheritance-base failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default PropInheritanceBaseGate;
