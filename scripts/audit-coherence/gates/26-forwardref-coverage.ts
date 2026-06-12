/**
 * 26-forwardref-coverage — Leaf-interactive components MUST use React.forwardRef.
 *
 * Coherence gate (deeper than the 01-19 core gates) focused on PROP INHERITANCE
 * and CROSS-COMPONENT CONSISTENCY. A consumer who wraps any of our leaf
 * interactives (a Button, an Input, an anchor, a role="tab" element, etc.) must
 * be able to pin a ref to the underlying DOM node — for focus management, for
 * scroll-into-view, for headless-UI integrations, for tooltips & popovers. If
 * the kit ships a component that swallows the ref, every downstream consumer
 * silently loses that capability. That's an inheritance regression.
 *
 * What it does
 * ------------
 *  - Scans every `.tsx` under `packages/ui-kit/src` (excludes tests, stories,
 *    showcases, examples — those are not component implementations; this
 *    includes the colocated `<Component>.examples.tsx` demo-snippet files).
 *  - For each component declaration it can find, determines two facts:
 *      (1) Does it render a "leaf interactive" host element directly?
 *          - JSX intrinsics: <button>, <a>, <input>, <textarea>, <select>,
 *            <option>, <summary>, <details>
 *          - ARIA: any element with role="button" | "link" | "tab" | "menuitem"
 *            | "option" | "checkbox" | "radio" | "switch" | "slider"
 *            | "tabpanel" | "treeitem" | "combobox" | "searchbox"
 *      (2) Is the component wrapped with `forwardRef` / `React.forwardRef`?
 *  - If (1) is true AND (2) is false → BLOCKER finding.
 *
 * Exemptions
 * ----------
 *  - Compound parent containers that follow the Trigger/Content pattern. The
 *    parent itself doesn't render a leaf interactive (it just composes); the
 *    leaf sub-components do, and they forwardRef individually. Detected by:
 *    a sibling named export in the same file matching `${Parent}Trigger`,
 *    `${Parent}Content`, `${Parent}Item`, `${Parent}Tab`, `${Parent}Button`,
 *    `${Parent}Anchor`, `${Parent}Link`, `${Parent}Trigger`, `${Parent}Root`.
 *    A component without any leaf interactive JSX of its own and with such a
 *    sibling is treated as a container — exempt.
 *
 * Programmatic API:
 *   const gate = new ForwardRefCoverageGate();
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/26-forwardref-coverage.ts [--root <dir>] [--json]
 *
 * Exit codes: 0 if every leaf interactive forwards a ref, 1 otherwise.
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

export interface SourceFile {
  /** Absolute, normalised file path. */
  file: string;
  /** Raw file contents (utf-8). */
  content: string;
}

export interface DetectedComponent {
  /** Component name as declared in source. */
  name: string;
  /** 1-based line of declaration (best-effort). */
  line: number;
  /** Slice of source belonging to this component declaration's value (used for analysis). */
  body: string;
}

export interface ComponentAnalysis {
  /** Component metadata. */
  component: DetectedComponent;
  /** Whether the body renders a leaf interactive host/ARIA element directly. */
  rendersLeafInteractive: boolean;
  /** Which interactive shape(s) were detected — for messaging. */
  leafInteractiveKinds: string[];
  /** Whether the component is wrapped with forwardRef. */
  usesForwardRef: boolean;
  /** Whether the component looks like a compound-parent container. */
  isCompoundParent: boolean;
}

export interface ForwardRefCoverageGateOptions {
  /** Override file discovery (used by tests). */
  discoverFiles?: (ctx: AuditContext) => Promise<SourceFile[]>;
  /** Override component detection (used by tests). */
  detectComponents?: (file: SourceFile) => DetectedComponent[];
  /** Override per-component analysis (used by tests). */
  analyzeComponent?: (
    file: SourceFile,
    component: DetectedComponent,
  ) => ComponentAnalysis;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_ID = 26;
const GATE_NAME = 'forwardref-coverage';

const SCAN_GLOBS = ['packages/ui-kit/src/**/*.tsx'];

const SCAN_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.stories.tsx',
  '**/*.test.tsx',
  '**/*.spec.tsx',
  // Colocated doc demo snippets (`PixelButton.examples.tsx`) export example
  // render functions (Default, Sizes, AsChild, ...), not kit components —
  // same exemption gate 23 applies.
  '**/*.examples.tsx',
  '**/showcase/**',
  '**/examples/**',
];

/** JSX intrinsic tags that ARE leaf interactives by virtue of HTML semantics. */
const INTERACTIVE_HOST_TAGS = new Set<string>([
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'option',
  'summary',
  'details',
]);

/** ARIA roles that mark an element as a leaf interactive. */
const INTERACTIVE_ARIA_ROLES = new Set<string>([
  'button',
  'link',
  'tab',
  'tabpanel',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'treeitem',
  'combobox',
  'searchbox',
  'textbox',
]);

/**
 * Sibling names that mark the original as a "compound parent container".
 * E.g. <Menu> in the same file as <MenuTrigger> + <MenuContent>.
 */
const COMPOUND_SIBLING_SUFFIXES = [
  'Trigger',
  'Content',
  'Item',
  'Tab',
  'Button',
  'Anchor',
  'Link',
  'Root',
  'Group',
  'List',
  'Panel',
  'Label',
  'Description',
];

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

/** Strip block + line comments to avoid matching JSX/identifiers in commented-out code. */
export function stripComments(src: string): string {
  let out = '';
  let i = 0;
  let inString: '"' | "'" | '`' | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += src[i + 1];
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      out += ch;
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

// ---------------------------------------------------------------------------
// Component detection (heuristic)
// ---------------------------------------------------------------------------

/**
 * A regex catalogue of "this looks like a component declaration".
 *  - export const PascalCase = ( ... ) => ...
 *  - export const PascalCase = forwardRef(...)
 *  - export const PascalCase: FC<...> = ...
 *  - export function PascalCase(...) { ... }
 *  - const PascalCase = (...) => ...
 *  - const PascalCase = forwardRef(...)
 *  - function PascalCase(...) { ... }
 *
 * We only recognise PascalCase identifiers — that's the React component
 * convention. Sub-components attached as `Parent.Sub = ...` are picked up by
 * the compound-sibling detector instead.
 */
const RE_COMPONENT_DECL =
  /(?:^|\n)\s*(?:export\s+)?(?:const|let|var|function)\s+(?<name>[A-Z][A-Za-z0-9_]*)\b/g;

/**
 * Given a declared component's name and its starting index in the source,
 * extract a best-effort "body slice" that contains the JSX returned by it.
 * For arrow functions we scan from `=` to the next top-level "}" sibling. For
 * function declarations we scan from the `{` after the parameter list. Both
 * paths are approximated by brace-matching from the declaration onward.
 */
export function extractComponentBody(
  src: string,
  declStartIndex: number,
): string {
  // Find the first `{` after the declaration start, then balance braces.
  const firstBrace = src.indexOf('{', declStartIndex);
  if (firstBrace === -1) {
    // Could be a one-line arrow returning a parenthesised JSX expression.
    const semi = src.indexOf(';', declStartIndex);
    return src.slice(declStartIndex, semi === -1 ? src.length : semi);
  }
  let depth = 0;
  let i = firstBrace;
  let inString: '"' | "'" | '`' | null = null;
  while (i < src.length) {
    const ch = src[i];
    if (inString) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      i++;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return src.slice(declStartIndex, i + 1);
      }
    }
    i++;
  }
  return src.slice(declStartIndex);
}

export function detectComponentsDefault(file: SourceFile): DetectedComponent[] {
  const cleaned = stripComments(file.content);
  const seen = new Map<string, DetectedComponent>();
  RE_COMPONENT_DECL.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_COMPONENT_DECL.exec(cleaned)) !== null) {
    const name = m.groups?.name;
    if (!name) continue;
    // Skip identifiers that are clearly not components.
    if (isLikelyNonComponentName(name)) continue;
    if (seen.has(name)) continue;
    const declStart = m.index + m[0].indexOf(name);
    const body = extractComponentBody(cleaned, declStart);
    seen.set(name, {
      name,
      line: lineOf(cleaned, declStart),
      body,
    });
  }
  return Array.from(seen.values());
}

const NON_COMPONENT_NAME_HINTS = [
  /^Use[A-Z]/, // UseEffect-likes are still PascalCase but not components
  /^Provider$/,
  /Context$/,
  /Schema$/,
  /Props$/,
  /Type$/,
  /Enum$/,
  /Map$/,
  /Record$/,
  /Constants?$/,
  /Config$/,
  /Defaults?$/,
];

function isLikelyNonComponentName(name: string): boolean {
  return NON_COMPONENT_NAME_HINTS.some((re) => re.test(name));
}

// ---------------------------------------------------------------------------
// Component analysis (heuristic)
// ---------------------------------------------------------------------------

/** All host-tag opener regex: `<button`, `<button …>`, `<a `, etc. */
function hostTagRegex(tag: string): RegExp {
  // Use \b so e.g. <article> doesn't match <a>.
  return new RegExp(`<${tag}\\b`, 'g');
}

/** role="foo" attribute (single or double quote). */
const RE_ROLE_ATTR = /role\s*=\s*(['"])([^'"]+)\1/g;

/**
 * forwardRef detection. Matches both:
 *   - forwardRef<...>(
 *   - React.forwardRef<...>(
 * possibly preceded by whitespace, possibly inside a `memo(forwardRef(...))`
 * wrapper, etc.
 */
const RE_FORWARDREF = /\b(?:React\.)?forwardRef\s*(?:<[^>]*>)?\s*\(/g;

export function analyzeComponentDefault(
  file: SourceFile,
  component: DetectedComponent,
): ComponentAnalysis {
  const body = component.body;

  // Detect leaf interactives — host tags first.
  const leafKinds = new Set<string>();
  for (const tag of INTERACTIVE_HOST_TAGS) {
    const re = hostTagRegex(tag);
    if (re.test(body)) leafKinds.add(`<${tag}>`);
  }
  // ARIA roles in this component's JSX.
  RE_ROLE_ATTR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_ROLE_ATTR.exec(body)) !== null) {
    const role = m[2].trim();
    if (INTERACTIVE_ARIA_ROLES.has(role)) {
      leafKinds.add(`role="${role}"`);
    }
  }

  const rendersLeafInteractive = leafKinds.size > 0;

  // forwardRef check — scoped to this component's body.
  RE_FORWARDREF.lastIndex = 0;
  const usesForwardRef = RE_FORWARDREF.test(body);

  // Compound parent? Exempt only if NOT rendering a leaf itself.
  const isCompoundParent =
    !rendersLeafInteractive && hasCompoundSibling(file.content, component.name);

  return {
    component,
    rendersLeafInteractive,
    leafInteractiveKinds: Array.from(leafKinds).sort(),
    usesForwardRef,
    isCompoundParent,
  };
}

/**
 * Returns true if the file declares a sibling named `${name}${Suffix}` (e.g.
 * `MenuTrigger` alongside `Menu`), suggesting a compound-component pattern.
 */
export function hasCompoundSibling(fileContent: string, name: string): boolean {
  const cleaned = stripComments(fileContent);
  for (const suffix of COMPOUND_SIBLING_SUFFIXES) {
    const sibling = `${name}${suffix}`;
    // Look for a declaration of sibling — same broad regex shape we use above.
    const re = new RegExp(
      `(?:^|\\n)\\s*(?:export\\s+)?(?:const|let|var|function)\\s+${sibling}\\b`,
    );
    if (re.test(cleaned)) return true;
    // Or attached as a property: `Menu.Trigger = ...`
    const attached = new RegExp(`\\b${name}\\.${suffix}\\s*=`);
    if (attached.test(cleaned)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverFilesDefault(ctx: AuditContext): Promise<SourceFile[]> {
  const files = await fgGlob(SCAN_GLOBS, {
    cwd: ctx.repoRoot,
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: SCAN_IGNORE,
  });
  const out: SourceFile[] = [];
  for (const file of files.sort()) {
    try {
      const content = await fs.readFile(file, 'utf8');
      out.push({ file, content });
    } catch (err) {
      ctx.logger.debug(
        `skip unreadable file ${file}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Suggestion synth (ACTIONABLE — gives exact replacement code)
// ---------------------------------------------------------------------------

function suggestionFor(
  component: DetectedComponent,
  kinds: string[],
): string {
  const kindsList = kinds.join(', ');
  return [
    `Wrap "${component.name}" in React.forwardRef so consumers can attach a ref to the underlying ${kindsList}.`,
    'Exact replacement shape:',
    '',
    '  import { forwardRef } from "react";',
    '',
    `  type ${component.name}Props = React.ComponentPropsWithoutRef<"button"> & {`,
    '    /* your custom props */',
    '  };',
    '',
    `  export const ${component.name} = forwardRef<HTMLButtonElement, ${component.name}Props>(`,
    '    function $name(props, ref) {',
    '      return <button ref={ref} {...props} />;',
    '    },',
    '  );',
    '',
    `  ${component.name}.displayName = "${component.name}";`,
    '',
    'Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class ForwardRefCoverageGate extends Gate {
  readonly id = GATE_ID;
  readonly name = GATE_NAME;
  readonly description =
    'Every leaf-interactive ui-kit component (renders a button/a/input/role=button/role=tab/etc.) MUST be wrapped in React.forwardRef so consumers inherit the underlying DOM ref. Compound parents that delegate to *.Trigger / *.Content sub-components are exempt.';

  private readonly discover: (ctx: AuditContext) => Promise<SourceFile[]>;
  private readonly detectComponents: (file: SourceFile) => DetectedComponent[];
  private readonly analyzeComponent: (
    file: SourceFile,
    component: DetectedComponent,
  ) => ComponentAnalysis;

  constructor(options: ForwardRefCoverageGateOptions = {}) {
    super();
    this.discover = options.discoverFiles ?? discoverFilesDefault;
    this.detectComponents = options.detectComponents ?? detectComponentsDefault;
    this.analyzeComponent = options.analyzeComponent ?? analyzeComponentDefault;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const files = await this.discover(ctx);

    if (files.length === 0) {
      ctx.logger.debug('no .tsx files in ui-kit src — gate passes vacuously');
      return gateOk(this.name, Date.now() - start);
    }

    const findings: GateFinding[] = [];

    for (const src of files) {
      let components: DetectedComponent[];
      try {
        components = this.detectComponents(src);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'blocker',
          file: toPosix(src.file),
          message: `component detector threw on ${toPosix(src.file)}: ${message}`,
          suggestion:
            'Inspect the file manually; the detector should never throw — file a bug if this persists.',
        });
        continue;
      }
      if (components.length === 0) continue;

      for (const component of components) {
        let analysis: ComponentAnalysis;
        try {
          analysis = this.analyzeComponent(src, component);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          findings.push({
            severity: 'blocker',
            file: toPosix(src.file),
            component: component.name,
            message: `component analyzer threw on "${component.name}" (line ${component.line}): ${message}`,
            suggestion:
              'Inspect the component manually; the analyzer should never throw — file a bug if this persists.',
          });
          continue;
        }

        if (!analysis.rendersLeafInteractive) {
          ctx.logger.debug(
            `${toPosix(src.file)}:${component.line} "${component.name}" — no leaf interactive, skipping`,
          );
          continue;
        }
        if (analysis.usesForwardRef) {
          ctx.logger.debug(
            `${toPosix(src.file)}:${component.line} "${component.name}" — forwardRef present`,
          );
          continue;
        }
        if (analysis.isCompoundParent) {
          ctx.logger.debug(
            `${toPosix(src.file)}:${component.line} "${component.name}" — compound parent (sibling Trigger/Content/...) exempt`,
          );
          continue;
        }

        findings.push({
          severity: 'blocker',
          file: toPosix(src.file),
          component: component.name,
          message:
            `"${component.name}" renders a leaf interactive element (${analysis.leafInteractiveKinds.join(', ')}) at line ${component.line} but is not wrapped in React.forwardRef. ` +
            'Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).',
          suggestion: suggestionFor(component, analysis.leafInteractiveKinds),
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
          'Usage: tsx scripts/audit-coherence/gates/26-forwardref-coverage.ts [options]',
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
  const gate = new ForwardRefCoverageGate();
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
        `forwardref-coverage failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default ForwardRefCoverageGate;
