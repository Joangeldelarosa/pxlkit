/**
 * 25-controlled-uncontrolled-pattern — Form-component controlled/uncontrolled coherence gate.
 *
 * Why this gate exists
 * --------------------
 * Every form-like component in the kit must support BOTH controlled and uncontrolled
 * usage so consumers can drop it into a controlled form (React Hook Form, etc.) OR
 * use it as a self-managing widget without lifting state.
 *
 * Concretely, a component is "form-like" if its props interface declares ANY of:
 *   - `onChange?: (next: T) => void`
 *   - `defaultValue?: T` (or `defaultChecked?:` — see checkbox convention)
 *
 * A LONE `value?:` (no onChange, no defaultValue) does NOT make a block
 * form-like: that shape is an identity/display prop (menu-item `value`,
 * composite-child registration), not controllable state.
 *
 * Checkbox convention: blocks declaring `checked?:` / `defaultChecked?:`
 * (native React checkbox/switch API) use THOSE as the controlled/uncontrolled
 * pair; a sibling `value?:` is the HTML form-serialization attribute
 * (`<input type="checkbox" value>`) and is ignored for slot detection.
 *
 * Once a component is detected as form-like, this gate enforces three rules:
 *
 *   R1 — MUST declare ALL THREE slots (`value?`, `onChange?`, `defaultValue?`).
 *        Shipping only controlled OR only uncontrolled is incomplete API surface.
 *
 *   R2 — MUST import and call `useControllableState` from `../hooks/useControllableState`
 *        (or `../../hooks/useControllableState` for nested folders). This is the
 *        single source of truth for the controlled/uncontrolled fork; hand-rolled
 *        forks drift out of sync with hook semantics over time. Calls with
 *        explicit generic type arguments (`useControllableState<T>(...)`) count.
 *
 *   R3 — `onChange` MUST have signature `(next: T) => void` where `T` is the
 *        value type — NOT `(event: React.ChangeEvent<...>) => void`. Event-style
 *        onChange leaks DOM concerns into the kit's value-oriented API.
 *
 * Each violation is reported as MAJOR severity with an actionable suggestion that
 * includes the exact replacement snippet.
 *
 * Programmatic API:
 *   const gate = new ControlledUncontrolledPatternGate();
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/25-controlled-uncontrolled-pattern.ts [--root <dir>] [--json]
 *
 * Exit codes:
 *   0 — no violations found
 *   1 — at least one violation (any MAJOR finding flips passed=false)
 *
 * Safety: pure read-only file scanning. No mutations, no network, no shell.
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
// Public types
// ---------------------------------------------------------------------------

export interface PropsBlock {
  /** Component name parsed from the interface/type identifier (strips trailing `Props`). */
  componentName: string;
  /** Identifier of the props type/interface itself, e.g. `PixelNumberInputProps`. */
  propsTypeName: string;
  /** Full text of the block contents between the opening `{` and matching `}`. */
  bodyText: string;
  /** 1-based line number where the block header (`interface X {`) starts. */
  startLine: number;
}

export interface FormComponentScan {
  /** Absolute POSIX path of the source file. */
  file: string;
  /** Source text of the file. */
  source: string;
  /** Every interface or type-alias block discovered in the file. */
  blocks: PropsBlock[];
  /** Whether the file imports `useControllableState`. */
  importsUseControllableState: boolean;
  /** Whether the file's source mentions `useControllableState(` as a call site. */
  callsUseControllableState: boolean;
}

export interface SlotSignature {
  /** Whether the block declares the controlled slot (`value?:` — or `checked?:` under the checkbox convention). */
  hasValue: boolean;
  /** Whether the block declares the uncontrolled slot (`defaultValue?:` — or `defaultChecked?:`). */
  hasDefaultValue: boolean;
  /** Whether the block declares `onChange?:`. */
  hasOnChange: boolean;
  /** Raw type text immediately after `onChange?:`, or null when absent. */
  onChangeTypeText: string | null;
  /** Inferred value-type text (from the controlled or uncontrolled slot), or null. */
  valueTypeText: string | null;
  /** Name of the controlled slot: `'value'` normally, `'checked'` for checkbox-convention blocks. */
  valueSlotName: string;
  /** Name of the uncontrolled slot: `'defaultValue'` normally, `'defaultChecked'` for checkbox-convention blocks. */
  defaultValueSlotName: string;
}

export interface ControlledUncontrolledPatternGateOptions {
  /**
   * Override file discovery. Default: scans
   * `packages/ui-kit/src/forms/**\/*.tsx` plus any other ui-kit source file
   * whose props look form-like.
   */
  discoverFiles?: (ctx: AuditContext) => Promise<string[]>;
  /** Override file reader — used by tests to inject in-memory sources. */
  readFile?: (absPath: string) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_NAME = 'controlled-uncontrolled-pattern';

const DEFAULT_SCAN_GLOBS = [
  'packages/ui-kit/src/forms/**/*.tsx',
  'packages/ui-kit/src/forms/**/*.ts',
  'packages/ui-kit/src/**/*.tsx',
];

const SCAN_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/__tests__/**',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.d.ts',
];

const USE_CONTROLLABLE_IMPORT_RE =
  /from\s+['"][^'"]*hooks\/useControllableState['"]/;
// Calls may carry explicit generic type arguments — `useControllableState<boolean>(`,
// `useControllableState<Date | null>(`, even multi-line generics. `[^(]*` deliberately
// spans newlines (char classes match `\n`) and nested `<>` until the call paren.
const USE_CONTROLLABLE_CALL_RE = /\buseControllableState\s*(?:<[^(]*>)?\s*\(/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/**
 * Walk forward from `openIdx` (which must point at `{`) and return the index of
 * the matching `}`. Naively respects nesting and skips `{` / `}` that appear
 * inside `'...'`, `"..."`, `` `...` ``, or `/* ... *​/` style comments.
 *
 * Returns -1 if no match is found before EOF (malformed source).
 */
export function findMatchingBrace(src: string, openIdx: number): number {
  if (src[openIdx] !== '{') return -1;
  let depth = 0;
  let i = openIdx;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    // Line comment
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i + 2);
      if (nl === -1) return -1;
      i = nl + 1;
      continue;
    }
    // Block comment
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) return -1;
      i = end + 2;
      continue;
    }
    // String literals
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < n) {
        const cc = src[i];
        if (cc === '\\') {
          i += 2;
          continue;
        }
        // Template literal ${...} can contain code with braces — be conservative
        // and stop tracking braces inside it by recursing once.
        if (quote === '`' && cc === '$' && src[i + 1] === '{') {
          const tplClose = findMatchingBrace(src, i + 1);
          if (tplClose === -1) return -1;
          i = tplClose + 1;
          continue;
        }
        if (cc === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === '{') {
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
      i++;
      continue;
    }
    i++;
  }
  return -1;
}

/**
 * Compute the 1-based line number for a character offset.
 */
export function offsetToLine(src: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i++) {
    if (src[i] === '\n') line++;
  }
  return line;
}

/**
 * Strip a trailing `Props` suffix from a type identifier when present.
 *  - `PixelNumberInputProps` → `PixelNumberInput`
 *  - `MyThing`               → `MyThing`
 */
export function stripPropsSuffix(name: string): string {
  return name.endsWith('Props') ? name.slice(0, -'Props'.length) : name;
}

/**
 * Locate every `interface X[<...>] extends? { ... }` and
 * `type X[<...>] = { ... }` block whose identifier ends in `Props`.
 *
 * We don't try to handle every TypeScript shape — only the canonical "props
 * interface" / "props type alias" patterns the kit actually uses. Type aliases
 * that are intersections (`type Props = A & { ... }`) are also caught because
 * we anchor on the first `{` after the `=` sign on the same statement.
 */
export function extractPropsBlocks(src: string): PropsBlock[] {
  const blocks: PropsBlock[] = [];

  // `interface Foo[<T>] [extends Bar] { ... }`
  const ifaceRe =
    /(?:^|\n)\s*(?:export\s+)?interface\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:<[^>]*>)?\s*(?:extends\s+[^{]+)?\{/g;
  let m: RegExpExecArray | null;
  while ((m = ifaceRe.exec(src)) !== null) {
    const name = m[1];
    if (!name.endsWith('Props')) continue;
    const openIdx = src.indexOf('{', m.index + m[0].length - 1);
    if (openIdx === -1) continue;
    const closeIdx = findMatchingBrace(src, openIdx);
    if (closeIdx === -1) continue;
    blocks.push({
      componentName: stripPropsSuffix(name),
      propsTypeName: name,
      bodyText: src.slice(openIdx + 1, closeIdx),
      startLine: offsetToLine(src, m.index),
    });
  }

  // `type Foo[<T>] = ... { ... }`
  const typeRe =
    /(?:^|\n)\s*(?:export\s+)?type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:<[^>]*>)?\s*=\s*([^;\n]*\{)/g;
  while ((m = typeRe.exec(src)) !== null) {
    const name = m[1];
    if (!name.endsWith('Props')) continue;
    // Find the `{` that opens the object portion — it's the LAST `{` in the
    // match group (after any `&` / `extends` text).
    const openIdx = m.index + m[0].lastIndexOf('{');
    const closeIdx = findMatchingBrace(src, openIdx);
    if (closeIdx === -1) continue;
    blocks.push({
      componentName: stripPropsSuffix(name),
      propsTypeName: name,
      bodyText: src.slice(openIdx + 1, closeIdx),
      startLine: offsetToLine(src, m.index),
    });
  }

  return blocks;
}

/**
 * Read the raw type expression following `propName?:` in a props body. Returns
 * `null` when the prop is absent. Best-effort: stops at a balanced semicolon,
 * comma, or newline that is not inside generics / parens / braces / strings.
 */
export function readPropType(body: string, propName: string): string | null {
  const re = new RegExp(
    `(?:^|[\\n;,{])\\s*(?:readonly\\s+)?${propName}\\?\\s*:\\s*`,
    'g',
  );
  const m = re.exec(body);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depthA = 0; // < >
  let depthB = 0; // ( )
  let depthC = 0; // { }
  const n = body.length;
  const start = i;
  while (i < n) {
    const ch = body[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch;
      i++;
      while (i < n) {
        if (body[i] === '\\') {
          i += 2;
          continue;
        }
        if (body[i] === q) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    // Skip arrow tokens `=>` so the `>` doesn't get treated as closing `<>`.
    if (ch === '=' && body[i + 1] === '>') {
      i += 2;
      continue;
    }
    // Skip comparison operators `>=` `<=` similarly.
    if ((ch === '>' || ch === '<') && body[i + 1] === '=') {
      i += 2;
      continue;
    }
    if (ch === '<') depthA++;
    else if (ch === '>') {
      if (depthA > 0) depthA--;
    } else if (ch === '(') depthB++;
    else if (ch === ')') depthB--;
    else if (ch === '{') depthC++;
    else if (ch === '}') {
      if (depthC === 0) break; // end of enclosing body
      depthC--;
    }
    if (depthA === 0 && depthB === 0 && depthC === 0) {
      if (ch === ';' || ch === ',' || ch === '\n') break;
    }
    i++;
  }
  return body.slice(start, i).trim() || null;
}

/**
 * Parse the controlled/uncontrolled slot signature out of a props body.
 *
 * Checkbox convention: when the block declares `checked?:` and/or
 * `defaultChecked?:` (native React checkbox/switch API), THOSE are the
 * controlled/uncontrolled pair. A `value?:` prop alongside them is the HTML
 * form-serialization attribute (`<input type="checkbox" value>`), not a
 * state slot, and must not be confused with the controlled slot.
 */
export function readSlotSignature(body: string): SlotSignature {
  const checkedTypeText = readPropType(body, 'checked');
  const defaultCheckedTypeText = readPropType(body, 'defaultChecked');
  const onChangeTypeText = readPropType(body, 'onChange');

  if (checkedTypeText !== null || defaultCheckedTypeText !== null) {
    return {
      hasValue: checkedTypeText !== null,
      hasDefaultValue: defaultCheckedTypeText !== null,
      hasOnChange: onChangeTypeText !== null,
      onChangeTypeText,
      valueTypeText: checkedTypeText ?? defaultCheckedTypeText,
      valueSlotName: 'checked',
      defaultValueSlotName: 'defaultChecked',
    };
  }

  const valueTypeText = readPropType(body, 'value');
  const defaultTypeText = readPropType(body, 'defaultValue');
  return {
    hasValue: valueTypeText !== null,
    hasDefaultValue: defaultTypeText !== null,
    hasOnChange: onChangeTypeText !== null,
    onChangeTypeText,
    valueTypeText: valueTypeText ?? defaultTypeText,
    valueSlotName: 'value',
    defaultValueSlotName: 'defaultValue',
  };
}

/**
 * Returns true when an `onChange` type text looks like an event-style handler
 * — i.e. `(e: React.ChangeEvent<...>) => void` or `(event: ChangeEvent<...>) => void`.
 * We err on the safe side: if the parameter type contains `ChangeEvent`,
 * `SyntheticEvent`, `FormEvent`, `KeyboardEvent`, `MouseEvent`, or `React.*Event`,
 * it's flagged.
 */
export function isEventStyleOnChange(typeText: string | null): boolean {
  if (!typeText) return false;
  // Strip outer parens of an arrow function head if present.
  const trimmed = typeText.trim();
  // Look ONLY at the parameter list to avoid matching event-bearing return types
  // (none in practice, but defensive).
  const arrowIdx = trimmed.indexOf('=>');
  const paramSegment = arrowIdx >= 0 ? trimmed.slice(0, arrowIdx) : trimmed;
  return /\b(?:React\.)?(?:ChangeEvent|SyntheticEvent|FormEvent|KeyboardEvent|MouseEvent|PointerEvent|FocusEvent|InputEvent)\b/.test(
    paramSegment,
  );
}

/**
 * Scan a single source file. Pure function — easy to unit-test with synthetic
 * source strings.
 */
export function scanSource(absFile: string, source: string): FormComponentScan {
  const blocks = extractPropsBlocks(source);
  return {
    file: toPosix(absFile),
    source,
    blocks,
    importsUseControllableState: USE_CONTROLLABLE_IMPORT_RE.test(source),
    callsUseControllableState: USE_CONTROLLABLE_CALL_RE.test(source),
  };
}

/**
 * Decide whether a block is "form-like". Components that don't touch value
 * semantics at all are silently skipped (e.g. `PixelButtonProps`).
 *
 * A lone controlled slot (`value?` with NO `onChange` and NO `defaultValue`)
 * does NOT count: without a change callback or an uncontrolled slot there is
 * no state to fork — that shape is an identity/display prop (menu-item
 * `value`, progress display, composite-child registration), not form state.
 */
export function isFormLike(sig: SlotSignature): boolean {
  return sig.hasDefaultValue || sig.hasOnChange;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverFilesDefault(ctx: AuditContext): Promise<string[]> {
  const files = await fgGlob(DEFAULT_SCAN_GLOBS, {
    cwd: ctx.repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: SCAN_IGNORE,
    unique: true,
  });
  return files.map(toPosix).sort();
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export class ControlledUncontrolledPatternGate extends Gate {
  readonly id = 25;
  readonly name = GATE_NAME;
  readonly description =
    'Every form-like component must support BOTH controlled (value+onChange) AND uncontrolled (defaultValue) modes, use useControllableState, and ship a value-typed onChange (not an event handler).';

  private readonly discover: (ctx: AuditContext) => Promise<string[]>;
  private readonly readFile: (absPath: string) => Promise<string>;

  constructor(options: ControlledUncontrolledPatternGateOptions = {}) {
    super();
    this.discover = options.discoverFiles ?? discoverFilesDefault;
    this.readFile =
      options.readFile ?? ((p: string) => fs.readFile(p, 'utf8'));
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const files = await this.discover(ctx);

    if (files.length === 0) {
      ctx.logger.debug(
        'no candidate source files found — gate passes vacuously',
      );
      return gateOk(this.name, Date.now() - start);
    }

    const findings: GateFinding[] = [];

    for (const file of files) {
      let source: string;
      try {
        source = await this.readFile(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.logger.warn(`failed to read ${file}: ${message}`);
        continue;
      }

      const scan = scanSource(file, source);
      const formBlocks = scan.blocks
        .map((b) => ({ block: b, sig: readSlotSignature(b.bodyText) }))
        .filter(({ sig }) => isFormLike(sig));

      if (formBlocks.length === 0) continue;

      // R2 — file-level: must import + call useControllableState
      if (!scan.importsUseControllableState || !scan.callsUseControllableState) {
        for (const { block } of formBlocks) {
          const importHint = scan.importsUseControllableState
            ? ''
            : "import { useControllableState } from '../hooks/useControllableState';\n";
          findings.push({
            severity: 'major',
            file: scan.file,
            component: block.componentName,
            message: `${block.propsTypeName} declares controlled/uncontrolled slots but the file does not ${
              scan.importsUseControllableState ? 'call' : 'import'
            } useControllableState.`,
            suggestion: `Use the shared hook to fork controlled vs uncontrolled. Add:\n${importHint}const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });\n\nHand-rolled forks drift out of sync with the hook semantics over time.`,
          });
        }
      }

      for (const { block, sig } of formBlocks) {
        // R1 — must have ALL THREE slots (convention-aware: checkbox-style
        // blocks use `checked`/`defaultChecked` as the pair).
        const missing: string[] = [];
        if (!sig.hasValue) missing.push(`${sig.valueSlotName}?`);
        if (!sig.hasDefaultValue) missing.push(`${sig.defaultValueSlotName}?`);
        if (!sig.hasOnChange) missing.push('onChange?');
        if (missing.length > 0) {
          const valueType =
            sig.valueTypeText ?? '/* the value type, e.g. string | number */';
          findings.push({
            severity: 'major',
            file: scan.file,
            component: block.componentName,
            message: `${block.propsTypeName} is missing required slot(s): ${missing.join(
              ', ',
            )}. Form components must expose BOTH controlled and uncontrolled APIs.`,
            suggestion: `Add the missing prop(s) to ${block.propsTypeName}:\n  ${sig.valueSlotName}?: ${valueType};\n  ${sig.defaultValueSlotName}?: ${valueType};\n  onChange?: (next: ${valueType}) => void;\nThen fork with useControllableState.`,
          });
        }

        // R3 — onChange must be value-typed, not event-style
        if (sig.hasOnChange && isEventStyleOnChange(sig.onChangeTypeText)) {
          const valueType =
            sig.valueTypeText ?? '/* the value type, e.g. string | number */';
          findings.push({
            severity: 'major',
            file: scan.file,
            component: block.componentName,
            message: `${block.propsTypeName}.onChange is event-style (${sig.onChangeTypeText}). Form components in the kit expose value-typed onChange so consumers don't deal with DOM events.`,
            suggestion: `Replace the onChange signature with:\n  onChange?: (next: ${valueType}) => void;\nThen call \`onChange?.(next)\` from the internal change handler instead of forwarding the React.ChangeEvent.`,
          });
        }
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
          'Usage: tsx scripts/audit-coherence/gates/25-controlled-uncontrolled-pattern.ts [options]',
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
  const gate = new ControlledUncontrolledPatternGate();
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
        `${GATE_NAME} failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default ControlledUncontrolledPatternGate;
